import { ITaskDefinition, ITaskState } from "./interfaces.ts";

export class TaskState extends Map<string, unknown> implements ITaskState
{
    constructor(iterable?: Iterable<readonly [string, unknown]> | null | undefined)
    {
        super(iterable)
    }

    get secrets() : Record<string, string | undefined>
    {
        let _secrets = this.get("secrets");
        if (!_secrets)
        {
            _secrets = {};
            this.set("secrets", _secrets);
        }

        return _secrets as Record<string, string | undefined>;
    }

    get env() : Record<string, string | undefined>
    {
        let _env = this.get("env");
        if (!_env)
        {
            _env = {};
            this.set("env", _env);
        }

        return _env as Record<string, string | undefined>;
    }

    get tasks() : Record<string, ITaskDefinition | undefined>
    {
        let _tasks = this.get("tasks");
        if (!_tasks)
        {
            _tasks = {};
            this.set("tasks", _tasks);
        }

        return _tasks as Record<string, ITaskDefinition | undefined>;
    }

    get task() : ITaskDefinition
    {
        let _task = this.get("task");
        if (!_task)
        {
            _task = {};
            this.set("task", _task);
        }

        return _task as ITaskDefinition;
    }
}