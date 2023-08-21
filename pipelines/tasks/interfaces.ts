import { PsOutput } from "../../tasks/core/core.ts";

export interface ITaskState {
    /**
     * Gets the unique identifier for the task. This is used to reference the task
     * from other tasks or from the command line. It must not including any spaces
     * and may include only letters, numbers, dashes, colons, dots, and underscores.
     */
    id: string;
    /**
     * Gets or sets the name of the task. This is used to display the task in the console.
     */
    name: string;
    /**
     * Gets or sets the description of the task. This is used to display the description
     * of the task in the console.
     */
    description?: string;
    /**
     * Gets the dependencies for the task. This is used to determine the order
     * in which tasks are executed.  If a task has no dependencies, it will be
     * executed first.  If a task has dependencies, it will be executed after
     * all of its dependencies have been executed.
     */
    deps: string[];
    /**
     * Gets or sets the timeout for the task. This is used to determine how long the task
     * will be allowed to run before it is cancelled.  If the task is cancelled, it will
     * be marked as a timeout and treated as a failure.
     */
    timeout?: number;
    /**
     * Gets a value indicating whether the task was forced to run. 
     */
    force?: boolean;
    /**
     * Gets a value indicating whether the task was skipped. 
     */
    skip?: boolean;
    /**
     * Gets the status of the task.
     */
    status: TaskStatus | 'running';
    /**
     * Gets the outputs of the task.
     */
    outputs: Record<string, unknown>;
}

export interface ITaskContext {
    /**
     * Gets the environment variables for the current task. This is primarily used
     * to get environment variables and may be use to set environment variables
     * for dependent tasks within the same run.
     */
    readonly env: Record<string, string | undefined>;
    /**
     * Gets the secrets for the current task. This is primarily used to get secrets.
     * The internal implementation is subject to change before 1.0.
     */
    readonly secrets: Record<string, string | undefined>;
    /**
     * Gets the tasks for the current run. This object will hold task state for tasks
     * that have been previous executed in the same run.  The key is the task name
     * that has been converted to underscore case.  Spaces, colons, slashes, and
     * periods are replaced with underscores.
     */
    readonly tasks: Record<string, ITaskState | undefined>;
    /**
     * Gets the task state for the current task that is executing. 
     */
    readonly task: ITaskState;
}

export type TaskReturn = Promise<Record<string, unknown> | PsOutput | void> | Record<string, unknown> | PsOutput | void;
export type TaskRun = (state: ITaskContext, signal?: AbortSignal) => TaskReturn;
export type TaskStatus = "ok" | "failed" | "timeout" | "skipped" | "cancelled";

export interface ITask {
    /**
     * Gets the unique identifier for the task. This is used to reference the task
     * from other tasks or from the command line. It must not including any spaces
     * and may include only letters, numbers, dashes, colons, dots, and underscores.
     */
    id: string;
    /**
     * Gets or sets the name of the task. This is used to display the task in the console.
     */
    name: string;
    /**
     * Gets or sets the description of the task. This is used to display the description
     * of the task in the console.
     */
    description?: string;
    /**
     * Gets the dependencies for the task. This is used to determine the order
     * in which tasks are executed.  If a task has no dependencies, it will be
     * executed first.  If a task has dependencies, it will be executed after
     * all of its dependencies have been executed.
     */
    deps: string[];
    /**
     * Gets or sets the timeout for the task. This is used to determine how long the task
     * will be allowed to run before it is cancelled.  If the task is cancelled, it will
     * be marked as a timeout and treated as a failure.
     */
    timeout?: number;
    /**
     * Gets or sets a value indicating whether the task should be forced to run. If the
     * task is forced to run, it will be executed even if a previous task has failed.
     * This is useful for cleanup tasks.
     */
    force?: boolean;
    /**
     * Gets or sets a value indicating whether the task should be skipped. The task
     * context is passed to the skip function, so that tasks can be skipped based
     * on the state of previous tasks, environment variables, or other context information.
     */
    skip?: boolean | ((state: ITaskContext) => Promise<boolean> | boolean);
    /**
     * Gets the function that will be executed when the task is run.
     */
    run: TaskRun;
}

export interface IPartialTaskCore {
    /**
     * Gets the unique identifier for the task. This is used to reference the task
     * from other tasks or from the command line. It must not including any spaces
     * and may include only letters, numbers, dashes, colons, dots, and underscores.
     */
    id: string;
    /**
     * Gets or sets the name of the task. This is used to display a friendly name
     * task in the console and may use emojis and other characters not in the id.
     */
    name?: string;
    /**
     * Gets or sets the description of the task. This is used to display the description
     * of the task in the console.
     */
    description?: string;
    /**
     * Gets the dependencies for the task. This is used to determine the order
     * in which tasks are executed.  If a task has no dependencies, it will be
     * executed first.  If a task has dependencies, it will be executed after
     * all of its dependencies have been executed.
     */
    deps?: string[];
    /**
     * Gets or sets the timeout for the task. This is used to determine how long the task
     * will be allowed to run before it is cancelled.  If the task is cancelled, it will
     * be marked as a timeout and treated as a failure.
     */
    timeout?: number;
    /**
     * Gets or sets a value indicating whether the task should be forced to run. If the
     * task is forced to run, it will be executed even if a previous task has failed.
     * This is useful for cleanup tasks.
     */
    force?: boolean;
    /**
     * Gets or sets a value indicating whether the task should be skipped. The task
     * context is passed to the skip function, so that tasks can be skipped based
     * on the state of previous tasks, environment variables, or other context information.
     */
    skip?: boolean | ((state: ITaskContext) => Promise<boolean> | boolean);
}

export interface IPartialTask extends IPartialTaskCore {
    run: TaskRun;
}

export interface IPartialShellTask extends IPartialTaskCore {
    /**
     * Gets or sets the shell to use for the task. If not specified, the default shell
     * for the os will be used.
     */
    shell?: string;
    /**
     * Gets or sets the inline script to run for the task.
     */
    script: string;
}

export interface IPartialShellFileTask extends IPartialTaskCore {
    /**
     * Gets or sets the shell to use for the task. If not specified, the default shell
     * for the os will be based on the file extension.
     */
    shell?: string;
    /**
     * Gets or sets the file of the script to run for the task.
     */
    file: string;
}

export interface ITaskBuilder {
    /**
     * Sets multiple attributes on the task.
     * @param attributes 
     */
    set(attributes: Partial<Omit<ITask, "id" | "run">>): ITaskBuilder;
    /**
     * Sets the description of the task.
     * @param description 
     */
    description(description: string): ITaskBuilder;
    /**
     * Sets the timeout for the task.
     * @param timeout 
     */
    timeout(timeout: number): ITaskBuilder;
    /**
     * Sets the name of the task.
     * @param name 
     */
    name(name: string): ITaskBuilder;
    /**
     * Sets whether the task should be skipped.
     * @param skip 
     */
    skip(skip: boolean | ((state: ITaskContext) => Promise<boolean> | boolean)): ITaskBuilder;
    /**
     * Sets the dependencies for the task.
     * @param deps
     */
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
