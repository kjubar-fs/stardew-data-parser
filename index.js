/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 1:11:14 PM
 *  Last update: 29 Jul 2024, 6:04:26 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { Item, Buff, ConsumptionEffects } from "./src/data-model/classes.js";
import {
    DATA_DIRECTORY, STRINGS_DIRECTORY,
    loadRawJson
} from "./src/files/read.js";

const DEBUG = false;

const objStrings = loadRawJson(STRINGS_DIRECTORY, "Objects");
const newStrings = loadRawJson(STRINGS_DIRECTORY, "1_6_Strings");

const objectsParsed = [];
const buffsParsed = [];

processDataFile("Objects", processObject);
console.log(objectsParsed[214]);

/**
 * Process a data file.
 * @param {string} filename data file to process
 * @param {(id: string, obj: any) => void} processCallback callback to run for each object in the data
 */
function processDataFile(filename, processCallback) {
    // load data and check properties
    const objects = loadRawJson(DATA_DIRECTORY, filename);
    if (DEBUG) checkProps(objects);

    // call process callback for every item
    for (const id in objects) {
        const obj = objects[id];
        processCallback(id, obj);
    }
}

/**
 * Process an item from the Objects data file.
 * @param {string} id item ID
 * @param {any} obj item data object
 */
function processObject(id, obj) {
    // pull out non-optional props
    const nameInternal = obj.Name;
    const name = resolveString(obj.DisplayName);
    const description = resolveString(obj.Description);
    const type = obj.Type.toLowerCase();
    const category = obj.Category;
    const spriteIndex = obj.SpriteIndex;

    // create item
    const item = new Item(
        id, nameInternal, name, description,
        type, category, spriteIndex
    )

    // set optional props
    if (!!obj.Price) {
        item.price = obj.Price;
    }

    if (!!obj.Texture) {
        item.texture = obj.Texture.split("\\").pop();
    }

    // handle edible items
    const edibility = obj.Edibility;
    if (!!edibility || edibility === 0) {
        const energy = Math.floor(edibility * 2.5);
        const health = Math.floor(edibility * 1.125);
        const effects = new ConsumptionEffects(energy, health);

        // handle possible buffs array
        if (!!obj.Buffs) {
            for (const buff of obj.Buffs) {
                // if we have a BuffId, this points to a static buff
                if (!!buff.BuffId) {
                    effects.buffs.push(buff.BuffId);
                }

                // otherwise, this is a custom buff
                // so create a custom buff and add its ID to the array
                else {
                    const newBuff = new Buff(
                        `Food_${id}`,
                        `${name} Effects`,
                        buff.Duration,
                        0
                    )
                    newBuff.effects = buff.CustomAttributes;

                    // add new buff to storage and item
                    buffsParsed.push(newBuff);
                    effects.buffs.push(newBuff.id);
                    if (DEBUG) console.log(newBuff);
                }
            }
        }

        item.onConsume = effects;
    }

    // add new object to storage
    objectsParsed.push(item);
    if (DEBUG) console.log(item);
}

/**
 * Given the data parsed from a JSON file, check the unique
 * and optional/non-optional properties.
 * @param {any} objects parsed objects from JSON file
 */
function checkProps(objects) {
    // get a list of unique properties from all objects in the list
    const uniqueProps = new Set();
    const objVals = Object.values(objects);
    for (const item of objVals) {
        for (const prop of Object.keys(item)) {
            uniqueProps.add(prop);
        }
    }
    console.log("All props:", uniqueProps);

    // determine non-optional and optional props
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

/**
 * Given a localized placeholder string, resolve it to an actual string.
 * @param {string} str placeholder string to resolve to a localized string
 */
function resolveString(str) {
    // split localized string to get file and string key
    const splits = str
        .replaceAll("[", "")
        .replaceAll("]", "")
        .split("\\")
        .pop()
        .split(":")
    const file = splits[0];
    const strKey = splits[1];

    switch (file) {
        case "Objects":
            return objStrings[strKey];

        case "1_6_Strings":
            return newStrings[strKey];
    
        default:
            return str;
    }
}