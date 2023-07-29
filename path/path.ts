
import * as _path from './deps.ts';
import { ParsedPath } from "./deps.ts";

export interface IPath {
    common(paths: string[], sep?: string): string

    globToRegExp(glob: string, options?: _path.GlobToRegExpOptions): RegExp;

    join(...paths: string[]): string;

    resolve(...paths: string[]): string;

    dirname(path: string): string;

    basename(path: string): string;

    basenameWithoutExtension(path: string) : string;

    extname(path: string): string;

    isAbsolute(path: string): boolean;

    isGlob(path: string): boolean;

    normalize(path: string): string;

    normalizeGlob(glob: string, { globstar }?: _path.GlobOptions): string

    relative(from: string, to: string): string;

    toNamespacedPath(path: string): string;

    parse(pathString: string): ParsedPath;

    fromFileUrl(url: string | URL): string;

    toFileUrl(path: string): URL;
}

export const path: IPath = _path;