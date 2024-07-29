/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 1:11:14 PM
 *  Last update: 29 Jul 2024, 2:01:34 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { DATA_DIRECTORY, loadRawJson } from "./src/files/read.js";

// process objects
const objects = loadRawJson(DATA_DIRECTORY, "Objects");
checkObjectProps(objects);



/**
 * Given the data parsed from a JSON file, check the unique
 * and optional/non-optional properties.
 * @param {object[]} objects parsed objects from JSON file
 */
function checkObjectProps(objects) {
    const uniqueProps = new Set();
    const objVals = Object.values(objects);
    for (const item of objVals) {
        for (const prop of Object.keys(item)) {
            uniqueProps.add(prop);
        }
    }
    console.log("All props:", uniqueProps);
    const nonOptionalProps = new Set();
    const optionalProps = new Set();
    for (const prop of uniqueProps) {
        const isNotOptional = objVals.every(obj => obj.hasOwnProperty(prop));
        if (isNotOptional) {
            nonOptionalProps.add(prop);
        } else {
            optionalProps.add(prop);
        }
    }
    console.log("Non-optional props:", nonOptionalProps);
    console.log("Opional props:", optionalProps);
}