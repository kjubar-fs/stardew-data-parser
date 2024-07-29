/*
 *  Author: Kaleb Jubar
 *  Created: 26 Jul 2024, 5:17:35 PM
 *  Last update: 29 Jul 2024, 12:22:17 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import path from "node:path";
import { readFileSync } from "node:fs";

const DATA_DIRECTORY = "../../raw-data-escaped";
const curDir = import.meta.dirname

/**
 * Load a raw JSON file as an object
 * @param {string} dir directory to load from
 * @param {file} file filename to load (no extension)
 */
export function loadRawJson(dir, file) {
    const filename = `${file}.json`;
    const fullPath = path.join(curDir, DATA_DIRECTORY, dir, filename);
    console.log(`Loading raw JSON from ${fullPath}`)
    try {
        const json = readFileSync(fullPath, "utf8");
        const data = JSON.parse(json);
        console.log(data);
    } catch (err) {
        console.log(err);
    }
}