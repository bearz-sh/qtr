import { IHostWriter } from "../../dep.ts";
import { parseFlags } from "../../dep.ts";
import { IRunnerOptions } from "./interfaces.ts";

export function handleArgs(args: string[], hostWriter: IHostWriter) {
    const cmds: string[] = [];
    const flags = parseFlags(args,{
        boolean: ["skip-deps", "list", "help", "version"],
        string: ["task-file", "env-file", "env"],
        collect: ["env-file", "env"],
        alias: {
            h: "help",
            s: "skip-deps",
            t: "timeout",
            e: "env",
            ef: "env-file",
            tf: "task-file",
            l: "list",
            wd: "working-directory",
            v: "version",
        },
        default: {
            "working-directory": Deno.cwd(),
            list: false,    
            "skip-deps": false,
            timeout: 3 * 60,
            help: false,
            "task-file": undefined,
            "env-file": [],
            env: [],
            version: false,
        },
    });

    const unparsed = flags["_"];
    if (Array.isArray(unparsed)) {
        cmds.push(...unparsed.map((u) => u.toString()));
    }
    
    let wd = flags["working-directory"] as string || undefined;
    if (typeof wd !== "string") {
        wd = undefined;
    }

    const envFile: string[] = flags["env-file"] ?? [];
    const env: string[] = flags["env"] ?? [];
    let taskFile: string | undefined = undefined;

    if (flags["task-file"]) {
        const taskFileArg = flags["task-file"] as string;
        if (taskFileArg.length) {
            taskFile = taskFileArg;
        }
    }

    const timeoutValue = flags.timeout || flags.t;

    let to =  3 * 60;
    if (typeof timeoutValue === "string") {
        to = Number(timeoutValue);
    } else if (typeof timeoutValue !== "number") {
        to = flags.timeout as number;
    }

    if (isNaN(to)) {
        to = 3 * 60;
    }

    const help = (flags["help"] || flags["h"]) === true;
    const skipDeps = (flags["skip-deps"] || flags["s"]) === true;
    const list = (flags["list"] || flags["l"]) === true;
    const version = (flags["version"] || flags["v"]) === true;

    const options: IRunnerOptions = {
        cmds,
        skipDeps: skipDeps,
        timeout: to,
        help: help,
        taskFile: taskFile,
        hostWriter: hostWriter,
        envFile: envFile,
        env: env,
        workingDirectory: wd,
        list: list,
        version: version,
    }

    if (cmds.length === 0) {
        cmds.push("default");
    }

    return options;
}