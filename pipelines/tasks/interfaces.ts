import { PsOutput } from "../../tasks/core/core.ts";

export interface ITaskDefinition {
    id: string;
    name: string;
    description?: string;
    deps: string[];
    timeout?: number;
    force?: boolean;
    skip?: boolean;
    status: TaskStatus | 'running';
    outputs: Record<string, unknown>;
}

export interface ITaskState {
    readonly env: Record<string, string | undefined>;
    readonly secrets: Record<string, string | undefined>;
    readonly tasks: Record<string, ITaskDefinition | undefined>;
    readonly task: ITaskDefinition;
}

export type TaskReturn = Promise<Record<string, unknown> | PsOutput | void> | Record<string, unknown> | PsOutput | void;
export type TaskRun = (state: ITaskState, signal?: AbortSignal) => TaskReturn;
export type TaskStatus = "ok" | "failed" | "timeout" | "skipped" | "cancelled";

export interface ITask {
    id: string;
    name: string;
    description?: string;
    deps: string[];
    timeout?: number;
    force?: boolean;
    skip?: boolean | ((state: ITaskState) => Promise<boolean> | boolean);
    run: TaskRun;
}

export interface IPartialTaskCore {
    id: string
    name?: string;
    description?: string;
    deps?: string[];
    timeout?: number;
    force?: boolean;
    skip?: boolean | (() => Promise<boolean>);
}

export interface IPartialTask extends IPartialTaskCore {
    run: TaskRun;
}

export interface IPartialShellTask extends IPartialTaskCore {
    shell?: string;
    script: string;
}

export interface IPartialShellFileTask extends IPartialTaskCore {
    shell?: string;
    file: string;
}

export interface ITaskBuilder {
    set(attributes: Partial<Omit<ITask, "id" | "run">>): ITaskBuilder;
    description(description: string): ITaskBuilder;
    timeout(timeout: number): ITaskBuilder;
    name(name: string): ITaskBuilder;
    skip(skip: boolean | (() => Promise<boolean>)): ITaskBuilder;
    deps(...deps: string[]): ITaskBuilder;
}

export interface ITaskCollection extends Iterable<ITask> {
    size: number;
    add(task: ITask): ITaskBuilder;
    addRange(tasks: Iterable<ITask>): void;
    at(index: number): ITask;
    get(id: string): ITask | undefined;
    has(id: string): boolean;
    toArray(): ITask[];
}
