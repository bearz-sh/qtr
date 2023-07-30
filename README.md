# Quasar Task Runner (QTR)

A flexible task runner that lets you write common tasks in TypeScript using Deno.

QTR allows one to run shell tasks or use Deno's built in functionality, Deno's std
library, npm modules (that currently run in deno), or other deno/es 6 modules.

Deno will allow anyone to share tasks through es6 modules which can be imported
just by using the import keyword or function.

QTR provides built in functionality to make it easier to script tasks by providing
objects for fs (file system), os (operating system), path, env (for environment
variables and the path variable), and ps (process). All importable from the
`https://deno.land/x/qtr@{VERSION}/mod.ts` file.

## Sample Task File

The task runner looks for a `./quasar_tasks.ts` or a `./.quasar/tasks.ts` file.

The use case for the `.quasar` folder is to allow a separate folder to setup
Deno within a tool like vscode where the deno extension works best in a single folder
or to group all related files in a single folder.

```typescript
import { 
    ps, 
    shellTask, 
    shellFileTask, 
    task, 
    parseAndRun, 
    path, 
    os,
    scriptRunner, 
} from "https://deno.land/x/qtr@{VERSION}/mod.ts";

const cwd = path.dirname(path.fromFileUrl(import.meta.url))
const sln = `${cwd}/project.sln`

task("hello", () => {
    console.log("hello world");
});

task("dotnet:restore", async () => {
    const o = await ps.run("dotnet", "restore", sln);
    o.throwOrContinue();
    // see the PsOutput object
    console.log(o);
});

task("dotnet:build", ["dotnet:restore"], async () => {
    const o = await ps.run("dotnet", "build", sln, "-c", "Release")
    o.throwOrContinue();
});

task({
    id: "echo",
    name: "echo =)",
    description: "runs the echo command",
    skip: true, // skips running this task
    run: async function() {
       if(os.isWindows) {
            const o = await scriptRunner.runScript("pwsh", "echo 'hello'");
            o.throwOrContinue(); // throws when the exit code is not 0
       } else {
            const o = await ps.capture("echo", "'hello'");
            o.throwOrContinue();
       }
    }
});

// runs an inline powershell script calling pwsh.exe
// bash, sh, pwsh, and powershell are currently supported.

// first parameter is the id of the task.
// second is the name of the shell
// third is the inline script 
shellTask("print:json", "pwsh", ```
$content = Get-Content "global.json" -Raw | ConvertFrom-Json

Write-Host $content

```);


shellTaskFile("run:script", "bash", "path/to/script.sh");

task("default", ["hello"]);

// if this is provided, then this script can be run with
// deno using the following command, but this part will be
// skipped if its called using qtr or is called by another script.

// deno run -A --unstable ./path/to/tasks.ts [...TASK] [OPTIONS]
// e.g. deno run -A --unstable ./path/to/tasks.ts hello
if (import.meta.main) {
    const exitCode = await parseAndRun(Deno.args);
    Deno.exit(exitCode);
}
```

## Sample Cli Usage

Run the default task

```bash
qtr 
```

Run a specific task and all task dependencies

```bash
# runs the build taks
qtr build
```

Run a specific task and skip all dependencies

```bash
# runs the build taks
qtr build --skip-deps
```

Run multiple tasks

```bash
qtr build test
```

Help

```bash
qtr --help
```

List tasks

```bash
qtr --list
```

## LICENSE

Everything is MIT unless otherwise noted in a file.