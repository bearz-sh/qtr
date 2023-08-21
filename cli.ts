
import { TaskCollection } from './pipelines/tasks/task_collection.ts'
import { HostWriter } from "./deps.ts";
import { run, handleArgs, setHostWriter, setTasks } from './pipelines/runner/mod.ts'

if (import.meta.main) {
    const hostWriter = new HostWriter();
    setTasks(new TaskCollection());
    setHostWriter(new HostWriter());
    const options = handleArgs(Deno.args, hostWriter);
    if (!options.taskFile)
    {
        let pwd = Deno.cwd();
        if (pwd.startsWith("http")) {
            const url = new URL(pwd);
            pwd = url.pathname;
        } 

        options.taskFile = `${pwd}/quasar_tasks.ts`;
    }

    const exitCode = await run(options);
    Deno.exit(exitCode);
}