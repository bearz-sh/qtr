import { ITask } from "../tasks/interfaces.ts";
import { defaultTimeout } from "./constants.ts";
import { MessageBus } from "./message_bus.ts";
import { ITaskResult } from "./interfaces.ts";
import { TaskCancellationMessage, TaskEndMessage, TaskSkippedMessage, TaskStartMessage, TaskTimeoutMessage } from "./messages.ts";

export function handleTask(
    task: ITask,
    state: Map<string, unknown>,
    timeout = defaultTimeout,
    cancellationToken: AbortSignal,
    
) : Promise<ITaskResult> {
    return new Promise((resolve, reject) => {
        let start = new Date();
        const result : ITaskResult = { status: "ok", task, start, end: new Date() };
    
        if (cancellationToken.aborted) {
            result.status = "cancelled";
            resolve(result);
        }

        const controller = new AbortController();
        const signal = controller.signal;
        const handle = setTimeout(() => {
            controller?.abort(`Task ${task.id} timed out after ${timeout} seconds`);
        }, timeout * 1000);
        if (signal?.aborted) {
            reject(signal?.reason);
        }

        start = new Date();
        const onAbort = () => {
            clearTimeout(handle);
            resolve({ status: "cancelled", task, start, end: new Date() });
        };
        signal.addEventListener("abort", onAbort, { once: true });

        try {
            const tr = task.run(state, signal);
            if (tr instanceof Promise) {
                tr
                .then(r => {
                    if (r !== undefined) {
                        state.set(`${task.id}.output`, r);
                    }

                    return r;
                })
                .then(() => resolve({status: "ok", task, start, end: new Date()}))
                .catch(e => resolve({status: "failed", task, start, end: new Date(), e}))
            } else {
                clearTimeout(handle);
                signal.removeEventListener("abort", onAbort);
                if (tr !== undefined) {
                    state.set(`${task.id}.output`, tr);
                }
                resolve({status: "ok", task, start, end: new Date()});
            }
        } catch (e) {
            resolve({ status: "failed", task, start, end: new Date(), e});
        } finally {
            signal.removeEventListener("abort", onAbort);
            clearTimeout(handle);
            controller.abort();
        }
    });
}

export async function handleTasks(
    tasks: ITask[], 
    state: Map<string, unknown>,
    messageBus: MessageBus, 
    timeout = defaultTimeout,
    cancellationToken: AbortSignal) {
    const results: ITaskResult[] = [];
    let failed = false;
    for (const task of tasks) {
        const force = task.force ?? false;
        if (cancellationToken.aborted && !force) {
            const result: ITaskResult = { status: "cancelled", task, start: new Date(), end: new Date() };
            messageBus.send(new TaskCancellationMessage(result, cancellationToken));
            results.push(result);
            return results;
        }

        if (task.skip) {
            let skip = false;
            if (typeof task.skip === "function") {
                skip = await task.skip();
            } else {
                skip = task.skip;
            }

            if (skip) {
                const result: ITaskResult = { status: "skipped", task: task, start: new Date(), end: new Date() };
                messageBus.send(new TaskSkippedMessage(result));
                results.push(result);
                continue;
            }
        }

        if (failed && !force) {
            const result: ITaskResult = { status: "skipped", task: task, start: new Date(), end: new Date() };
            messageBus.send(new TaskSkippedMessage(result));
            results.push(result);
            continue;
        }

        const to = task.timeout ?? timeout ?? defaultTimeout;
        try {
            messageBus.send(new TaskStartMessage(task));
            const result = await handleTask(task, state, to, cancellationToken);
            results.push(result);
            switch(result.status)
            {
                case "timeout":
                    messageBus.send(new TaskTimeoutMessage(result, to));
                    break;

                case "cancelled":
                    failed = true;
                    messageBus.send(new TaskCancellationMessage(result, cancellationToken));
                    return results;

                default:
                    if (result.status === "failed")
                       failed = true;
                    messageBus.send(new TaskEndMessage(result));
                    break;
            }
        } catch(e) {
            failed = true;
            const result: ITaskResult = { status: "failed", task, start: new Date(), end: new Date(), e };
            results.push(result);
            messageBus.send(new TaskEndMessage(result));
        }
    }

    return results;
}