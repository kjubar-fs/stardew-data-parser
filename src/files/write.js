/*
 *  Author: Kaleb Jubar
 *  Created: 26 Jul 2024, 5:17:38 PM
 *  Last update: 30 Jul 2024, 12:51:49 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import path from "node:path";
import { writeFileSync } from "node:fs";
import { DEBUG, OUTPUT_DIRECTORY } from "../globals.js";

// use import.meta.dirname because we don't have access to __dirname in modules
const curDir = import.meta.dirname;

/**
 * Save an array of JS object as a JSON file.
 * @param {string} dir directory to load from
 * @param {file} file filename to load (no extension)
 * @returns a JavaScript object formed from the loaded JSON
 */
export function writeObjectsToJson(file, objects) {
    // create full qualified path
    const filename = `${file}.json`;
    const fullPath = path.join(curDir, OUTPUT_DIRECTORY, filename);
    if (DEBUG) console.log(`Writing parsed JSON to ${fullPath}`);

    try {
        // convert objects to JSON and write synchronously
        const json = JSON.stringify(objects, null, 4);
        writeFileSync(fullPath, json);
        return true;
    } catch (err) {
        // report any errors caught and return null
        console.error(`Error saving to ${fullPath}:`, err);
        return false;
    }
}