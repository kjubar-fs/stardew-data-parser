/*
 *  Author: Kaleb Jubar
 *  Created: 26 Jul 2024, 5:17:35 PM
 *  Last update: 30 Jul 2024, 1:17:50 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import path from "node:path";
import { readFileSync } from "node:fs";
import { DEBUG, ROOT_DATA_DIRECTORY } from "../globals.js";

// use import.meta.dirname because we don't have access to __dirname in modules
const curDir = import.meta.dirname;

/**
 * Load a raw JSON file as an object
 * @param {string} dir directory to load from
 * @param {string} file filename to load (no extension)
 * @returns a JavaScript object formed from the loaded JSON
 */
export function loadRawJson(dir, file) {
    // create full qualified path
    const filename = `${file}.json`;
    const fullPath = path.join(curDir, ROOT_DATA_DIRECTORY, dir, filename);
    if (DEBUG) console.log(`Loading raw JSON from ${fullPath}`);

    try {
        // load file synchronously and parse to JSON
        const json = readFileSync(fullPath, "utf8");
        const data = JSON.parse(json);
        return data;
    } catch (err) {
        // report any errors caught and return null
        console.error(`Error parsing ${fullPath}:`, err);
        return null;
    }
}