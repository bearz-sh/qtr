import { ps, shellTask, task, parseAndRun } from "../mod.ts";



task("default", ["echo"], () => {
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