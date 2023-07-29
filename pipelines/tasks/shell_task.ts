import { IS_WINDOWS } from "../../os/deps.ts";
import { ITask, ITaskBuilder } from "./interfaces.ts";
import { getTasks } from "./task_collection.ts";
import { scriptRunner } from "../../tasks/core/script_runner.ts";
import {} from "../../tasks/bash/register_script_runner.ts";
import {} from "../../tasks/sh/register_script_runner.ts";
import {} from "../../tasks/pwsh/register_script_runner.ts";
import {} from "../../tasks/powershell/register_script_runner.ts";

export function shellTask(id: string, shell: string, script: string): ITaskBuilder;
export function shellTask(id: string, script: string): ITaskBuilder;
export function shellTask(): ITaskBuilder {
    const tasks = getTasks();
    const id = arguments[0] as string;
    let shell = IS_WINDOWS ? "powershell" : "bash";
    let script = "";
    switch (arguments.length) {
        case 2:
            script = arguments[1] as string;
            break;
        case 3:
            shell = arguments[1] as string;
            script = arguments[2] as string;
            break;

        default:
            throw new Error("Invalid arguments");
    }

    const wrap = async function (_state: Map<string, unknown>, signal: AbortSignal): Promise<void> {
        const out = await scriptRunner.runScript(shell, script, {
            signal: signal,
        });
        out.throwOrContinue();
    };

    const task: ITask = {
        id,
        name: id,
        description: undefined,
        deps: [],
        timeout: undefined,
        run: wrap,
    };

    return tasks.add(task);
}

export function shellFileTask(id: string, shell: string, file: string): ITaskBuilder;
export function shellFileTask(id: string, file: string): ITaskBuilder;
export function shellFileTask(): ITaskBuilder {
    const tasks = getTasks();
    const id = arguments[0] as string;

    let shell = IS_WINDOWS ? "powershell" : "bash";
    let file = "";
    switch (arguments.length) {
        case 2:
            {
                file = (arguments[1] as string).trim();
                const text = Deno.readTextFileSync(file);
                const firstLine = text.split("\n")[0];
                if (firstLine.startsWith("#!")) {
                    const cmd = firstLine.substring(2).trim();
                    const parts = cmd.split(" ").map(s => s.trim()).filter(s => s.length > 0);
                    shell = parts[0];
                    if ((shell === "env" || shell === "/usr/bin/env") && parts.length > 1) {
                        shell = parts[1];
                    }

                    if (shell.endsWith(".exe")) {
                        shell = shell.substring(0, shell.length - 4);
                    }
                }
            }
            break;
        case 3:
            shell = arguments[1] as string;
            file = (arguments[2] as string).trim();
            break;

        default:
            throw new Error("Invalid arguments");
    }

    const wrap = async function (_state: Map<string, unknown>, signal: AbortSignal): Promise<void> {
        const out = await scriptRunner.runFile(shell, file, {
            signal: signal,
        });
        out.throwOrContinue();
    };

    const task: ITask = {
        id,
        name: id,
        description: undefined,
        deps: [],
        timeout: undefined,
        run: wrap,
    };

    return tasks.add(task);
}
