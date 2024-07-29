/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 1:11:14 PM
 *  Last update: 29 Jul 2024, 3:36:05 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { Item } from "./src/data-model/classes.js";
import { DATA_DIRECTORY, loadRawJson } from "./src/files/read.js";

// process objects
const objects = loadRawJson(DATA_DIRECTORY, "Objects");
checkProps(objects);

const buffs = loadRawJson(DATA_DIRECTORY, "Buffs");
checkProps(buffs);

/**
 * Given the data parsed from a JSON file, check the unique
 * and optional/non-optional properties.
 * @param {object[]} objects parsed objects from JSON file
 */
function checkProps(objects) {
    const uniqueProps = new Set();
    const objVals = Object.values(objects);
    for (const item of objVals) {
        for (const prop of Object.keys(item)) {
            uniqueProps.add(prop);
        }
    }
    console.log("All props:", uniqueProps);
    const nonOptionalProps = [];
    const optionalProps = [];
    for (const prop of uniqueProps) {
        const isNotOptional = objVals.every(obj => obj.hasOwnProperty(prop));
        if (isNotOptional) {
            nonOptionalProps.push(prop);
        } else {
            optionalProps.push(prop);
        }
    }
    console.log("Non-optional props:", nonOptionalProps);
    console.log("Opional props:", optionalProps);
}