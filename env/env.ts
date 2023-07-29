import { IEnvSubstitutionOptions } from "./deps.ts";
import { expand, get, getOrDefault, getRequired, has, set, remove, path, toObject } from "./deps.ts"; 

export interface IEnvPath {
    get(): string;

    set(path: string): void;

    add(value: string, prepend?: boolean): void;

    remove(value: string): void;

    has(value: string): boolean;

    split(): string[];
}

export interface IEnv {
    expand(template: string, options?: IEnvSubstitutionOptions): string;

    get(name: string): string | undefined;

    getOrDefault(key: string, defaultValue: string): string;

    getRequired(name: string): string;

    set(key: string, value: string): void;
    set(key: string, value: string, isSecret: boolean): void;
    set(map: { [key: string]: string }): void;

    remove(name: string): void;

    has(name: string): boolean;

    toObject(): Record<string, string | undefined>;

    path: IEnvPath;
}

export const env: IEnv = {
    expand,
    get,
    getOrDefault,
    getRequired,
    set,
    remove,
    has,
    toObject,
    path,
};