import { 
    exec, 
    execSync, 
    exists, 
    existsSync, 
    generateScriptFile, 
    generateScriptFileSync, 
    IExecOptions, 
    IExecSyncOptions, 
    registerExe, 
    rm,
    rmSync
} from "../core/core.ts";


registerExe("pwsh", {
    windows: [
        "%ProgramFiles%/PowerShell/7/pwsh.exe",
        "%ProgramFiles(x86)%/PowerShell/7/pwsh.exe",
        "%ProgramFiles%/PowerShell/6/pwsh.exe",
        "%ProgramFiles(x86)%/PowerShell/6/pwsh.exe",
    ],
    linux: [
        "/opt/microsoft/powershell/7/pwsh",
        "/opt/microsoft/powershell/6/pwsh",
    ]
});

// PWSH
export function pwsh(args?: string[], options?: IExecOptions) {
    return exec("pwsh", args, options);
}

pwsh.cli = pwsh;
pwsh.sync = function (args?: string[], options?: IExecOptions) {
    return execSync("pwsh", args, options);
};

pwsh.scriptFile = async function (scriptFile: string, options?: IExecOptions) {
    return await pwsh.cli([
        "-ExecutionPolicy",
        "Bypass",
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `. ${scriptFile}`,
    ], options);
};

pwsh.scriptFileSync = function (scriptFile: string, options?: IExecSyncOptions) {
    return pwsh.sync([
        "-ExecutionPolicy",
        "Bypass",
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `. ${scriptFile}`,
    ], options);
};

pwsh.script = async function (script: string, options?: IExecOptions) {
    script = `
$ErrorActionPreference = 'Stop'
${script}
if ((Test-Path -LiteralPath variable:\\LASTEXITCODE)) { exit $LASTEXITCODE }
`;
    const scriptFile = await generateScriptFile(script, ".ps1");
    try {
        return await pwsh.cli([
            "-ExecutionPolicy",
            "Bypass",
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `. ${scriptFile}`,
        ], options);
    } finally {
        if (await exists(scriptFile)) {
            await rm(scriptFile);
        }
    }
};

pwsh.scriptSync = function (script: string, options?: IExecSyncOptions) {
    script = `
$ErrorActionPreference = 'Stop'
${script}
if ((Test-Path -LiteralPath variable:\\LASTEXITCODE)) { exit $LASTEXITCODE }
`;
    const scriptFile = generateScriptFileSync(script, ".ps1");
    try {
        return pwsh.sync([
            "-ExecutionPolicy",
            "Bypass",
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `. ${scriptFile}`,
        ], options);
    } finally {
        if (existsSync(scriptFile)) {
            rmSync(scriptFile);
        }
    }
};