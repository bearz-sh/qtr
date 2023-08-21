# Quasar Task Runner (QTR)

A flexible task runner that lets you write common tasks in TypeScript using Deno.

QTR allows one to run shell tasks or use Deno's built in functionality, Deno's std
library, npm modules (that currently run in deno), or other deno / es 6 modules.

Deno will allow anyone to share tasks through es6 modules which can be imported
just by using the import keyword or function.

QTR provides built in functionality to make it easier to script tasks by providing
objects for fs (file system), os (operating system), path, env (for environment
variables and the path variable), and ps (process). All importable from the
`https://deno.land/x/qtr@{VERSION}/mod.ts` file.

## Install

Use deno to install the cli as a named script by
running `deno install --unstable -qAn qtr "https://deno.land/x/qtr@{VERSION}/cli.ts"`
where `{VERSION}` is a specific version number that has been released.

To install qtr, run:

```bash
deno install --unstable -qAn qtr "https://deno.land/x/qtr@{VERSION}/cli.ts"
```

To uninstall qtr, run:

```bash
deno uninstall qtr
```

## Sample Task File

The task runner looks for a `./quasar_tasks.ts` or a `./.quasar/tasks.ts` file.

The use case for the `.quasar` folder is to allow a separate folder to setup
Deno within an editor like vscode where the deno extension works best in a single folder
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

task("dotnet_restore", async () => {
    const o = await ps.run("dotnet", "restore", sln);
    o.throwOrContinue();
    // see the PsOutput object
    console.log(o);
});

task("dotnet_build", ["dotnet_restore"], (ctx) => {
    // view what is available in the context 
    // such as previous tasks states, environment variables, etc.
    console.log(ctx);
    console.log(os.isWindows ? ctx.env["USERPROFILE"] : ctx.env["HOME"])
    console.log(ctx.tasks.dotnet_restore)

    // exit code will be handed by the task runner when PsOutput or Prosmise<PsOutput> 
    // is returned.
    return ps.run("dotnet", "build", sln, "-c", "Release")
});

task({
    id: "echo",
    name: "echo =)",
    description: "runs the echo command",
    skip: true, // skips running this task
    force: false, // will force the task to run, even if previous tasks fail
    run: async function() {
        if(os.isWindows) {
            // throws when the exit code is not 0
            await scriptRunner.runScript("pwsh", "echo 'hello'")
                .then(o => o.throwOrContinue());
        } else {
            await ps.capture("echo", "'hello'")
                .then(o => o.throwOrContinue());
        }
    }
});

task({
    id: "echo2",
    name: "echo2 =)",
    description: "runs the echo command",
    skip: false, // skips running this task
    run: async function() {
        // returning either PsOutput or Promise<PsOutput>
        // will trigger the task runner to handle the exit code for you. e.g when 
        // exit code is not equal to zero, it will throw.
        if(os.isWindows) {
            return scriptRunner.runScript("pwsh", "echo 'hello'");
        } else {
            return ps.capture("echo", "'hello'");
        }
    }
});

// runs an inline powershell script calling pwsh.exe
// The following shells are supported: bash, sh, pwsh, and powershell.

// first parameter is the id of the task.
// second is the name of the shell
// third is the inline script 
shellTask("print_json", "pwsh", ```
$content = Get-Content "global.json" -Raw | ConvertFrom-Json

Write-Host $content

```);


shellTaskFile("run_script", "bash", "path/to/script.sh");

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
# runs the build task
qtr build
```

Run a specific task and skip all dependencies

```bash
# runs the build task and skips any deps
qtr build --skip-deps
```

Run multiple tasks in order of task names

```bash
qtr build test
```

Pass in environment variables

```bash
qtr build -e MY_VAR="VALUE" -e MY_OTHER_VAR="VALUE2"
```

Pass in environment variable files

```bash
qtr build --ev "./path/to/.env"
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
