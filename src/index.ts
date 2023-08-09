import type { Plugin, PluginOption } from "vite";
import type { UserConfig } from "./types";
import { resolveConfig } from "./config";
import { hasPhpTranslations } from "./analyse";
import FullReload from "vite-plugin-full-reload";
import { parseAll } from "./parse";

export const LaravelI18n = (
    userConfig: UserConfig = {}
): Plugin | PluginOption[] => {
    const config = resolveConfig(userConfig);
    const shouldProcess = hasPhpTranslations(config.langDirectory);

    return [
        {
            name: "vite-plugin-laravel-i18n",
            enforce: "post",
            handleHotUpdate(ctx) {
                if (
                    shouldProcess &&
                    ctx.file.startsWith(config.langDirectory) &&
                    ctx.file.endsWith(".php")
                ) {
                    const parsed = parseAll(config.langDirectory);
                }
            },
            buildStart() {
                if (shouldProcess) {
                    parseAll(config.langDirectory);
                }   
            }
        },
        FullReload([config.langDirectory + "/**/*.php"]),
    ];
};
