import { IHostWriter, HostWriter } from "../../deps.ts";
import { run } from "./run.ts";
import { handleArgs } from './handle_args.ts'


export * from './globals.ts'
export { run, handleArgs }
export async function parseAndRun(args: string[], hostWriter?: IHostWriter) {
    const options = handleArgs(args, hostWriter ?? new HostWriter());
    return await run(options);
}