import { sep } from "node:path";
import { readdirSync, statSync } from "node:fs";

export const hasPhpTranslations = (folderPath: string): boolean => {
    folderPath = folderPath.replace(/[\\/]$/, "") + sep;

    try {
        const folders = readdirSync(folderPath)
            .filter((file) => statSync(folderPath + sep + file).isDirectory())
            .sort();

        for (const folder of folders) {
            const lang = {};

            const files = readdirSync(folderPath + sep + folder).filter(
                (file) => /\.php$/.test(file)
            );

            if (files.length > 0) {
                return true;
            }
        }
    } catch (e) {
        console.log(e.message);
    }

    return false;
};
