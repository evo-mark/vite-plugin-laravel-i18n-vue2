import {
    readdirSync,
    statSync,
    readFileSync,
    writeFileSync,
    unlinkSync,
} from "node:fs";

import { join } from "node:path";
import { Engine } from "php-parser";

export const parseAll = (folderPath: string) => {
    folderPath = folderPath.replace(/[\\/]$/, "");

    const locales = readdirSync(folderPath)
        .map((file) => join(folderPath, file))
        .filter((path) => statSync(path).isDirectory())
        .sort();

    const data = [];
    for (const locale of locales) {
        const lang = {};

        getAllFiles(locale)
            .forEach((filePath) => {
                if (statSync(filePath).isDirectory()) {
                    return;
                }

                const key = filePath.substring(locale.length + 1).replace(/\.\w+$/, "")
                lang[key] = parse(
                    readFileSync(filePath).toString()
                );
            });

        data.push({
            locale: locale.substring(folderPath.length + 1),
            translations: convertToDotsSyntax(lang),
        });
    }

    console.log(`Outputting language files in ${data.length} localisations`);

    return data.map(({locale, translations}) => {
        const name = `php_${locale}.json`;
        const path = join(folderPath, name);

        writeFileSync(path, JSON.stringify(translations));
        return {name, path};
    });
};

const getAllFiles = (path: string) => {
    return readdirSync(path)
        .map((file) => join(path, file))
        .flatMap((filePath) => {
            if (statSync(filePath).isDirectory()) {
                return getAllFiles(filePath);
            }

            return [filePath];
        })
        .sort();
}

const parse = (content) => {
    const arr = new Engine({})
        .parseCode(content, "lang")
        .children.filter((child) => child.kind === "return")[0];

    /* @ts-ignore */
    return convertToDotsSyntax(parseItem(arr.expr));
};

const parseItem = (expr) => {
    if (expr.kind === "string") {
        return expr.value;
    }

    if (expr.kind === "array") {
        let items = expr.items.map((item) => parseItem(item));

        if (expr.items.every((item) => item.key !== null)) {
            items = items.reduce((acc, val) => Object.assign({}, acc, val), {});
        }

        return items;
    }

    if (expr.kind === "bin") {
        return parseItem(expr.left) + parseItem(expr.right);
    }

    if (expr.key) {
        return { [expr.key.value]: parseItem(expr.value) };
    }

    return parseItem(expr.value);
};

const convertToVueI18nFormat = (string) => {
    return string.replace(/:(\w+)/gi, "{$1}");
};

const convertToDotsSyntax = (list) => {
    const flatten = (items, context = "") => {
        const data = {};

        Object.entries(items).forEach(([key, value]) => {
            if (typeof value === "string") {
                value = convertToVueI18nFormat(value);

                data[context + key] = value;
                return;
            }

            Object.entries(flatten(value, context + key + ".")).forEach(
                ([itemKey, itemValue]) => {
                    data[itemKey] = itemValue;
                }
            );
        });

        return data;
    };

    return flatten(list);
};

const reset = (folderPath) => {
    const dir = readdirSync(folderPath);

    dir.filter((file) => file.match(/^php_/)).forEach((file) => {
        unlinkSync(folderPath + file);
    });
};
