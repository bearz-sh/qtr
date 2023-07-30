
import { TaskCollection } from './pipelines/tasks/task_collection.ts'
import { HostWriter } from "./dep.ts";
import { run, handleArgs, setHostWriter, setTasks } from './pipelines/runner/mod.ts'

if (import.meta.main) {
    const hostWriter = new HostWriter();
    setTasks(new TaskCollection());
    setHostWriter(new HostWriter());
    const options = handleArgs(Deno.args, hostWriter);
    if (!options.taskFile)
    {
        options.taskFile = "./quasar_tasks.ts";
    }

    const exitCode = await run(options);
    Deno.exit(exitCode);
}