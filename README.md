# vite-plugin-laravel-i18n-vue2

```
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { LaravelI18n } from "./vite-plugin-laravel-i18n";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.js"],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        LaravelI18n(),
    ],
});

```
