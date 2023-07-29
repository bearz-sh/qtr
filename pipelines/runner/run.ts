import { IRunnerOptions } from "./interfaces.ts";
import { IMessageSink, MessageBus } from "./message_bus.ts";
import { defaultMessageSink } from "./default_message_sink.ts";
import { exists } from "../../fs/deps.ts";
import { isAbsolute, resolve } from "../../path/deps.ts";
import { cwd } from "../../process/deps.ts";
import { HelpMessage, ListTaskMessage, TaskResultsMessage, UnhandledErrorMessage } from "./messages.ts";
import { ITask } from "../tasks/interfaces.ts";
import { setHostWriter, getTasks } from "./globals.ts";
import { handleTasks } from "./handle_tasks.ts";
import { env } from "../../mod.ts";
import { dotenv } from "../../dep.ts";

async function importTasks(options: IRunnerOptions, bus: MessageBus, writeError = true) {
    let { taskFile, workingDirectory } = options;
    workingDirectory ??= cwd();
   
    if (!taskFile) {
        taskFile = `${workingDirectory}/quasar_tasks.ts`;
    }

    if (!isAbsolute(taskFile)) {
        taskFile = resolve(workingDirectory, taskFile);
    }

    if (!await exists(taskFile)) {
        taskFile = `${workingDirectory}/.quasar/tasks.ts`;
    }

    if (!await exists(taskFile)) {
        if (writeError) {
            bus.send(new UnhandledErrorMessage(new Error(`Unable to find task file: ${taskFile}`)));
        }
        return false;
    }

    await import(taskFile);
    return true;
}

function detectCycles(tasks: ITask[], bus: MessageBus) {
    const stack = new Set<string>();
    const globalTasks = getTasks();
    const resolve = (task: ITask) => {
        if (stack.has(task.id)) {
            bus.send(
                new UnhandledErrorMessage(
                    new Error(`Cycle detected in task dependencies: ${[...stack.values(), task.id].join(" -> ")}`)));
            return false;
        }

        stack.add(task.id);
        for (const dep of task.deps) {
            const depTask = globalTasks.get(dep);
            if (!depTask) {
                bus.send(
                    new UnhandledErrorMessage(
                        new Error(`Dependency task '${dep}' not found for task '${task.name}'`)
                    )
                  );
                return false;
            }

            resolve(depTask);
        }

        stack.delete(task.id);
    };

    for (const task of tasks) {
        if (!resolve(task))
        {
            return false;
        }
    }

    return true;
}

function flattenTasks(tasks: ITask[], bus: MessageBus) : { result: ITask[], failed: boolean } {
    const result: ITask[] = [];
    const globalTasks = getTasks();

    // detect cycles

    for (const task of tasks) {
        if (!task) {
            continue;
        }

        for (const dep of task.deps) {
            const depTask = globalTasks.get(dep);
            if (!depTask) {
                bus.send(new UnhandledErrorMessage(new Error(`Dependency task '${dep}' not found for task '${task.name}'`)));
                return { result, failed: true };
            }

            const depResult = flattenTasks([depTask], bus);
            if (depResult.failed)
                return depResult;

            result.push(...depResult.result);
            if (!result.includes(depTask)) {
                result.push(depTask);
            }
        }

        if (!result.includes(task)) {
            result.push(task);
        }
    }

    return { result, failed: false };
}

export async function run(
    options: IRunnerOptions, 
    listner?: IMessageSink,
    signal?: AbortSignal): Promise<number> {
    if (options.hostWriter) {
        setHostWriter(options.hostWriter);
    }
    
    const bus = new MessageBus();
    listner ??= defaultMessageSink;
    bus.addListener(listner);

    if(options.help) {
        if (options.taskFile) {
            await importTasks(options, bus, false);
        }
       
        bus.send(new HelpMessage(options));
        return 0;
    }

    let pwd = Deno.cwd();
    if (options.workingDirectory) {
        if (!isAbsolute(options.workingDirectory)) {
            options.workingDirectory = resolve(pwd, options.workingDirectory);
        }

        if (!await exists(options.workingDirectory)) {
            bus.send(new UnhandledErrorMessage(`Working directory not found: ${options.workingDirectory}`));
            return 1;
        }

        Deno.chdir(options.workingDirectory);
        pwd = options.workingDirectory;
    }

    if (options.list) {
        if (options.taskFile) {
            const tasksImported = await importTasks(options, bus);
            if (!tasksImported) {
                return 1;
            }
        }
       
        bus.send(new ListTaskMessage(options));
        return 0;
    }

    const envVars : Record<string, string> = {};
    if (options.envFile && Array.isArray(options.envFile)) {
        const envFiles = options.envFile.map(f => String(f).trim());
        for(let i = 0; i < envFiles.length; i++) {
            let envFile = envFiles[i];
            if (!isAbsolute(envFile)) {
                envFile = resolve(pwd, envFile);
            }
    
            if (!await exists(envFile)) {
                bus.send(new UnhandledErrorMessage(`Environment file not found: ${options.envFile}`));
                return 1;
            }
    
            const decoder = new TextDecoder("utf-8");
            const content = decoder.decode(await Deno.readFile(envFile));
            const parsed = dotenv.parse(content);
            for (const key in parsed)
            {
                envVars[key] = parsed[key];
            }
        }
    }

    if (options.env && Array.isArray(options.env)) 
    {
        const envs = options.env.map(e => String(e).trim());
        for(let i = 0; i < envs.length; i++) 
        {
            const env = envs[i].trim();
            const parsed = dotenv.parse(env);
            for (const key in parsed)
            {
                envVars[key] = parsed[key];
            }
        }
    }

    for (const key in Object.keys(envVars)) {
        env.set(key, envVars[key]);
    }

    const tasksImported = await importTasks(options, bus);
    if (!tasksImported) {
        return 1;
    }

    const tasks = getTasks();
    if (tasks.size === 0) {
        bus.send(new UnhandledErrorMessage("No tasks found"));
        return 1;
    }

    let cmds = options.cmds ?? [];
    if(!options.cmds || options.cmds.length === 0) {
        cmds = ["default"];
    }

  
    const topLevelTasks: ITask[] = [];
    for (const cmd of cmds) {
        const task = tasks.get(cmd);
        if (!task) {
            if (cmd === "default") {
                bus.send(new UnhandledErrorMessage("No default task found"));
                bus.send(new HelpMessage(options));
                return 1;
            }

            bus.send(new UnhandledErrorMessage(`Task '${cmd}' not found`));
            bus.send(new HelpMessage(options));
            return 1;
        }

        topLevelTasks.push(task);
    }

    const state = new Map<string, unknown>();
    state.set("debug", false);
    state.set("options", options);
    const timeout = options.timeout ?? 3 * 60;
    let cancellationToken: AbortSignal;
    let cancellationController: AbortController | undefined;
    let handle: number | undefined;
    if (signal) {
        cancellationToken = signal;
    } else {
        cancellationController = new AbortController();
        cancellationToken = cancellationController.signal;
        handle = setTimeout(() => cancellationController?.abort(), timeout * 1000);
    }

    try {
        if ((topLevelTasks.length === 1 && topLevelTasks[0].deps.length === 0) || options.skipDeps) {
            const tasks = await handleTasks(topLevelTasks, state, bus, timeout, cancellationToken);
            bus.send(new TaskResultsMessage(tasks));
            return tasks.some(t => t.status !== "ok" && t.status !== "skipped") ? 1 : 0;
        }

        const cyclesDetected = !detectCycles(topLevelTasks, bus);
        if (cyclesDetected) {
            return 1;
        }

        const { result, failed } = flattenTasks(topLevelTasks, bus);
        if (failed) {
            return 1;
        }

        const tasks = await handleTasks(result, state, bus, timeout, cancellationToken);
        bus.send(new TaskResultsMessage(tasks));
        return tasks.some(t => t.status !== "ok" && t.status !== "skipped") ? 1 : 0;
    } finally {
        if (handle) {
            clearTimeout(handle);
        }
    }
}