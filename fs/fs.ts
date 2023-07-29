import { ICreateDirectoryOptions, IDirectoryInfo, IFileInfo, IMakeTempOptions, IRemoveOptions, ISymlinkOptions, IWriteOptions } from "./deps.ts";
import * as fs2 from "./deps.ts"

export interface IFileSystem {
    chmod(path: string | URL, mode: number): Promise<void>;

    chown(path: string | URL, uid: number, gid: number): Promise<void>;

    readDirectory(path: string | URL): AsyncIterable<IDirectoryInfo>;

    rename(oldPath: string | URL, newPath: string | URL): Promise<void>;

    readTextFile(path: string | URL): Promise<string>;

    readLink(path: string | URL): Promise<string>;

    mkdir(path: string | URL, options?: ICreateDirectoryOptions | undefined): Promise<void>;

    makeDirectory(path: string | URL, options?: ICreateDirectoryOptions): Promise<void>;

    makeTempDirectory(options?: IMakeTempOptions): Promise<string>;

    makeTempFile(options?: IMakeTempOptions): Promise<string>;

    stat(path: string | URL): Promise<IFileInfo>;

    isDirectory(path: string | URL): Promise<boolean>;

    isDirectorySync(path: string | URL): boolean;

    isFile(path: string | URL): Promise<boolean>;

    isFileSync(path: string | URL): boolean;

    link(oldPath: string, newPath: string): Promise<void>;

    linkSync(oldPath: string, newPath: string): void;

    lstat(path: string | URL): Promise<IFileInfo>;

    exists(path: string): Promise<boolean>;

    existsSync(path: string): boolean;

    readFile(path: string | URL): Promise<Uint8Array>;

    readFileSync(path: string | URL): Uint8Array;

    remove(path: string | URL, options?: IRemoveOptions): Promise<void>;

    removeSync(path: string | URL, options?: IRemoveOptions): void;

    symlink(target: string | URL, path: string | URL, type?: ISymlinkOptions): Promise<void>;

    symlinkSync(target: string | URL, path: string | URL, type?: ISymlinkOptions): void;

    writeTextFile(path: string | URL, data: string): Promise<void>;

    writeTextFileSync(path: string | URL, data: string): void;

    writeFile(
        path: string | URL,
        data: Uint8Array | ReadableStream<Uint8Array>,
        options?: IWriteOptions | undefined,
    ): Promise<void>;

    writeFileSync(
        path: string | URL,
        data: Uint8Array | ReadableStream<Uint8Array>,
        options?: IWriteOptions | undefined): void;
}


export const fs: IFileSystem = fs2;