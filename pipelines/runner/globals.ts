import { HostWriter, IHostWriter } from "../../dep.ts";
import { ITaskCollection } from "../tasks/interfaces.ts";
export { getTasks,setTasks } from "../tasks/task_collection.ts";

const g = globalThis as { 
    hostWriter?: IHostWriter
    tasks?: ITaskCollection
    debug?: boolean
    verbose?: boolean
}

export function getDebug() {
    return g.debug ?? false;
}

export function setDebug(debug: boolean) {
    g.debug = debug;
}

export function getVerbose() {
    return g.verbose ?? false;
}

export function setVerbose(verbose: boolean) {
    g.verbose = verbose;
}

export function getHostWriter(): IHostWriter {
    g.hostWriter ??= new HostWriter();
    return g.hostWriter!;
}

export function setHostWriter(writer: IHostWriter) {
    g.hostWriter = writer;
}

