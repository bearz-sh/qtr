import { cli, cliSync } from "./cli.ts";
import { IExecOptions, IExecSyncOptions, splat } from "../core/core.ts"

export interface PwshArgs extends Record<string, unknown> {
    nonInteractive?: boolean
    noLogo?: boolean
    noProfile?: boolean
    executionPolicy?: 'Bypass' | 'Restricted' | 'RemoteSigned' | 'Unrestricted' | 'AllSigned'
    command?: string
    file?: string
    inputFormat?: 'Text' | 'XML'
    encodedCommand?: string
    windowStyle?: 'Normal' | 'Minimal' | 'Maximized' | 'Hidden'
}

function converToParams(args: PwshArgs) {
    const params : string[] = []
    for(const key in Object.keys(args)) {
        const v = args[key];
        const name = key[0].toUpperCase() + key.substring(1);
        if (typeof v === 'boolean')
        {
            if (!v)
                continue;

            params.push(`-${name}`)
            continue;
        }

        params.push(name, String(v));
    }

    return params
}

export function pwsh(args: PwshArgs, options?: IExecOptions) {
    const params = converToParams(args);
    return cli(params, options);
}

export function pwshSync(args: PwshArgs, options?: IExecSyncOptions) {
    const params = converToParams(args);
    return cliSync(params, options);
}

pwshSync({
    command: 'Write-Host "Hello World"'
});