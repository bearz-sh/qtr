import { HostWriter, IHostWriter } from "../../dep.ts";
import { ITaskCollection } from "../tasks/interfaces.ts";
export { getTasks,setTasks } from "../tasks/task_collection.ts";

const g = globalThis as { 
    hostWriter?: IHostWriter
    tasks?: ITaskCollection
}

export function getHostWriter(): IHostWriter {
    g.hostWriter ??= new HostWriter();
    return g.hostWriter!;
}



export function setHostWriter(writer: IHostWriter) {
    g.hostWriter = writer;
}

