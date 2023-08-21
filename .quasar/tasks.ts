import { ps, shellTask, task, parseAndRun, env, fs } from "../mod.ts";

task("dep1", async (s) => {
    s.env['x'] = 'y'

    const envFile = s.env['QTR_ENV'];
    if (envFile) {
        let content = await fs.readTextFile(envFile);
        content += "\nMY_VAR=TEST"
        await fs.writeTextFile(envFile, content);
    }

    return {
        "out": 'x'
    }
})

task({
    id: "hello:2",
    description: "hello world",
    deps: ["dep1"],
    run: (state) => {
        
        console.log(state.env['x']);
        console.log(state.env["MY_VAR"]);
        console.log(state.tasks)
        console.log(state.task);
        console.log("hello world from hello task");
    },
});



task("test", () => ps.runSync("echo", "hello world"));

task("default", ["echo"], () => {
    if(env.has("TEST"))
    {
        console.log("TEST is set to " + env.get("TEST"));
    }

    console.log("Hello World!");
})
.description("The default task");

task("echo", ['bash'], async () => {
    await ps.run("echo", "hello world");
})
.description("echo using the echo executable");

task("skip", () => {

})
.skip(true);

task("cycle", ["cycle"], () => {
    console.log("cycle");
});

shellTask("pwsh", "pwsh", "echo 'hello world'");

shellTask("bash", "bash", "echo 'hello world'");

if (import.meta.main) {
    const exitCode = await parseAndRun(Deno.args);
    Deno.exit(exitCode);
}