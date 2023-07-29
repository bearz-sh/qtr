export {
    exec,
    execSync,
    findExe,
    findExeSync,
    generateScriptFile,
    generateScriptFileSync,
    registerExe,
    PsOutput,
} from "../../process/deps.ts";
export type {    
    IExecOptions,
    IExecSyncOptions, } from "../../process/deps.ts";

export { IS_WINDOWS } from "../../os/deps.ts";
export { exists, existsSync, rm, rmSync } from "../../fs/deps.ts";
export { splat } from "../../process/deps.ts"