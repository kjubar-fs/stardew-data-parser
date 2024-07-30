/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 1:11:14 PM
 *  Last update: 30 Jul 2024, 3:02:28 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { Item, Buff, ConsumptionEffects, Crop } from "./src/data-model/classes.js";
import { loadRawJson } from "./src/files/read.js";
import { writeObjectsToJson } from "./src/files/write.js";
import { DEBUG, DATA_DIRECTORY, STRINGS_DIRECTORY } from "./src/globals.js";

const objStrings = loadRawJson(STRINGS_DIRECTORY, "Objects");
const newStrings = loadRawJson(STRINGS_DIRECTORY, "1_6_Strings");
const csFileStrings = loadRawJson(STRINGS_DIRECTORY, "StringsFromCSFiles");

const objectsParsed = [];
const buffsParsed = [];
const cropsParsed = [];
const fruitTreesParsed = [];

// processDataFile("Objects", processObject);
// processDataFile("Buffs", processBuff);
// processDataFile("Crops", processCrop);
processDataFile("FruitTrees", processFruitTree);
console.log(fruitTreesParsed);

// writeObjectsToJson("objects", objectsParsed);
// writeObjectsToJson("buffs", buffsParsed);
// writeObjectsToJson("crops", cropsParsed);

///-----------
/// Functions
///-----------

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
    // get name (reused later)
    const name = resolveString(obj.DisplayName);

    // create base item
    const item = new Item(
        id,
        obj.Name,
        name,
        resolveString(obj.Description),
        obj.Type.toLowerCase(),
        obj.Category,
        obj.SpriteIndex
    );

    // set optional props
    if ("Price" in obj) {
        item.price = obj.Price;
    }

    if ("Texture" in obj) {
        item.texture = obj.Texture.split("\\").pop();
    }

    // handle edible items
    if ("Edibility" in obj) {
        const edibility = obj.Edibility;
        // round up for negative edibility
        const energy = edibility >= 0 ?
            Math.floor(edibility * 2.5) :
            Math.ceil(edibility * 2.5);
        // items with negative edibility don't damage health
        const health = edibility >= 0 ?
            Math.floor(edibility * 1.125) :
            0;
        const effects = new ConsumptionEffects(energy, health);

        // handle possible buffs array
        if (!!obj.Buffs) {
            effects.buffs = [];
            
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
                    );
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
 * Process a buff from the Buffs data file.
 * @param {string} id buff ID
 * @param {any} obj buff data object
 */
function processBuff(id, obj) {
    // create base buff
    const buff = new Buff(
        id,
        resolveString(obj.DisplayName),
        obj.Duration,
        obj.IconSpriteIndex
    );

    // set optional props
    if ("IsDebuff" in obj) {
        buff.isDebuff = obj.IsDebuff;
    }

    if ("Effects" in obj) {
        buff.effects = obj.Effects;
    }

    if ("Description" in obj) {
        buff.description = resolveString(obj.Description);
    }

    buffsParsed.push(buff);
    if (DEBUG) console.log(buff);
}

/**
 * Process a crop from the Crops data file.
 * @param {string} id crop ID
 * @param {any} obj crop data object
 */
function processCrop(id, obj) {
    // create base crop
    const crop = new Crop(
        id,
        obj.Seasons.map((season) => season.toLowerCase()),
        obj.DaysInPhase.reduce((acc, val) => acc + val, 0),
        obj.HarvestItemId,
        obj.SpriteIndex
    );

    // set optional props
    // IsRaised only appears if it's true
    if ("IsRaised" in obj) {
        crop.onTrellis = true;
    }

    // IsPaddyCrop only appears if it's true
    if ("IsPaddyCrop" in obj) {
        crop.paddyCrop = true;
    }

    if ("RegrowDays" in obj) {
        crop.regrowthDays = obj.RegrowDays;
    }

    if ("ExtraHarvestChance" in obj) {
        crop.extraHarvestChance = obj.ExtraHarvestChance;
    }

    if ("HarvestMinStack" in obj) {
        crop.minHarvest = obj.HarvestMinStack;
    }

    if ("HarvestMaxStack" in obj) {
        crop.maxHarvest = obj.HarvestMaxStack;
    }

    // NeedsWatering only appears if it's false
    if ("NeedsWatering" in obj) {
        crop.noWater = true;
    }

    // HarvestMethod only appears if it's "Scythe"
    if ("HarvestMethod" in obj) {
        crop.scytheHarvest = true;
    }
    
    cropsParsed.push(crop);
    if (DEBUG) console.log(crop);
}

/**
 * Process a fruit tree from the FruitTrees data file.
 * @param {string} id fruit tree ID
 * @param {any} obj fruit tree data object
 */
function processFruitTree(id, obj) {
    fruitTreesParsed.push(obj);
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
        
        case "StringsFromCSFiles":
            return csFileStrings[strKey];
    
        default:
            return str;
    }
}