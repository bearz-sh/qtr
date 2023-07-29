import {
    DIR_SEPARATOR,
    IS_DARWIN,
    IS_LINUX,
    IS_WINDOWS,
    NEW_LINE,
    PATH_SEPARATOR,
    RUNTIME_ARCH,
    OsFamily,
    RuntimeArch,
} from "./deps.ts";

export interface IOperatingSystem {
    platform: OsFamily;
    isWindows: boolean;
    isLinux: boolean;
    isDarwin: boolean;
    arch: RuntimeArch;
    pathSeparator: string;
    directorySeparator: string;
    newLine: string;
}


export const os: IOperatingSystem = {
    arch: RUNTIME_ARCH,
    platform: Deno.build.os,
    directorySeparator: DIR_SEPARATOR,
    isDarwin: IS_DARWIN,
    isLinux: IS_LINUX,
    isWindows: IS_WINDOWS,
    newLine: NEW_LINE,
    pathSeparator: PATH_SEPARATOR,
};