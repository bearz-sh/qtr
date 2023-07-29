import { 
    PsOutput, 
    IExecOptions, 
    IExecSyncOptions, 
    splat, 
    SplatOptions, 
    stdout, 
    stderr, 
    stdin,
    which,
    whichSync,
    run,
    exit,
    runSync,
    capture,
    captureSync,
    exec,
    execSync,
    cwd,
    isatty,
    chdir,
    isProcessElevated,
    args} from "./deps.ts";
export interface IProcess {
    readonly isElevated: boolean;

    cwd: string;

    readonly args: string[];

    readonly stdin: typeof stdin;

    readonly stdout: typeof stdout;

    readonly stderr: typeof stderr;

    run(...args: string[]): Promise<PsOutput>;

    runSync(...args: string[]): PsOutput;

    capture(...args: string[]): Promise<PsOutput>;

    captureSync(...args: string[]): PsOutput;

    exec(exec: string, args?: string[], options?: IExecOptions): Promise<PsOutput>;

    execSync(exec: string, args?: string[], options?: IExecSyncOptions): PsOutput;

    isatty(rid: number): boolean;

    push(path: string): void;

    pop(): void;

    exit(code?: number): void;

    splat(object: Record<string, unknown>, options?: SplatOptions): string[]

    which(exec: string): Promise<string | undefined>;

    whichSync(exec: string): string | undefined;
}

const defaultCwd = cwd();
const cwdHistory: string[] = [];

export const ps: IProcess = {
    args: args,
    cwd: "",
    stdin,
    stdout,
    stderr,
    isElevated: isProcessElevated(),
    push(path: string) {
        cwdHistory.push(cwd());
        chdir(path);
    },
    pop() {
        const last = cwdHistory.pop() || defaultCwd;
        chdir(last);
        return last;
    },
    capture,
    captureSync,
    run,
    runSync,
    isatty,
    exec,
    execSync,
    exit,
    which,
    whichSync,
    splat,
};

Reflect.defineProperty(ps, "cwd", {
    get: () => cwd(),
    set: (value: string) => chdir(value),
    enumerable: true,
    configurable: true,
});