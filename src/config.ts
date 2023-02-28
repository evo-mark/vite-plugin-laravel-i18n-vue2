import type { LaravelI18nConfig, UserConfig } from "./types";
import { isAbsolute, resolve } from "node:path";
import { normalizePath } from "vite";

export const defaultConfig: LaravelI18nConfig = {
    langDirectory: normalizePath(`${process.cwd()}/src/Lang`),
};

const processUserConfig = (userConfig: UserConfig): UserConfig => {
    if (
        userConfig?.langDirectory &&
        isAbsolute(userConfig?.langDirectory) === false
    ) {
        userConfig.langDirectory = normalizePath(
            resolve(userConfig.langDirectory)
        );
    }
    return userConfig;
};

export function resolveConfig(userConfig: UserConfig): LaravelI18nConfig {
    return Object.assign({}, defaultConfig, processUserConfig(userConfig));
}
