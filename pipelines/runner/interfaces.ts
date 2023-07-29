import { ITask } from "../tasks/interfaces.ts";
import { IHostWriter } from "../../dep.ts";
export type TaskStatus = "ok" | "failed" | "timeout" | "skipped" | "cancelled";

export interface IExecutionResult {
    status: TaskStatus;
    e?: Error | unknown;
    start: Date;
    end: Date;
}

export interface ITaskResult extends IExecutionResult {
    task: ITask;
}

export interface IRunnerOptions {
    cmds?: string[];
    skipDeps?: boolean;
    timeout?: number;
    help?: boolean;
    taskFile?: string;
    envFile?: string[]
    env?: string[]
    list?: boolean;
    tasksLoaded?: boolean;
    hostWriter?: IHostWriter;
    workingDirectory?: string;
}