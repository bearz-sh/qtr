import { IHostWriter } from "../../dep.ts";
import { run } from "./run.ts";
import { handleArgs } from './handle_args.ts'
import { HostWriter } from "../../dep.ts";


export * from './globals.ts'
export { run, handleArgs }
export async function parseAndRun(args: string[], hostWriter?: IHostWriter) {
    const options = handleArgs(args, hostWriter ?? new HostWriter());
    return await run(options);
}