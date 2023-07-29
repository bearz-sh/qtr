import { ps, task } from "../mod.ts";

task("default", () => {
    console.log("Hello World!");
});

task("echo", async () => {
    await ps.run("echo", "Hello World!");
});