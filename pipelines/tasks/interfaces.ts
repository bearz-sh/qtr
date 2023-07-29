export type TaskRun = (state?: Map<string, unknown>, signal?: AbortSignal) => Promise<void> | void;

export interface ITask {
    id: string;
    name: string;
    description?: string;
    deps: string[];
    timeout?: number;
    force?: boolean;
    skip?: boolean | (() => Promise<boolean>);
    run(state?: Map<string, unknown>, signal?: AbortSignal): Promise<void> | void;
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
