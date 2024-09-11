/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 1:11:14 PM
 *  Last update: 11 Sep 2024, 5:09:41 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { Item, Buff, ConsumptionEffects, Crop, FruitTree, CookingRecipe, ProductionSource, Category } from "./src/data-model/classes.js";
import { PROD_SRCS, PROD_UNITS } from "./src/data-model/enums.js";
import { loadRawJson } from "./src/files/read.js";
import { writeObjectsToJson } from "./src/files/write.js";
import { DEBUG, DATA_DIRECTORY, STRINGS_DIRECTORY, SEASONS } from "./src/globals.js";

const objStrings = loadRawJson(STRINGS_DIRECTORY, "Objects");
const newStrings = loadRawJson(STRINGS_DIRECTORY, "1_6_Strings");
const csFileStrings = loadRawJson(STRINGS_DIRECTORY, "StringsFromCSFiles");

const objectsParsed = {};
const buffsParsed = {};
const cropsParsed = {};
const fruitTreesParsed = {};
const cookingRecipesParsed = {};
let categoriesParsed = {};

processDataFile("Objects", processObject);
processDataFile("Buffs", processBuff);
processDataFile("Crops", processCrop);
processDataFile("FruitTrees", processFruitTree);
processDataFile("CookingRecipes", processCookingRecipe);
processDataFile("TV/CookingChannel", processTVRecipeSource);
processDataFile("SpecialRecipeSources", processSpecialRecipeSource);
processCategories();

writeObjectsToJson("objects", objectsParsed);
writeObjectsToJson("buffs", buffsParsed);
writeObjectsToJson("crops", cropsParsed);
writeObjectsToJson("fruitTrees", fruitTreesParsed);
writeObjectsToJson("cookingRecipes", cookingRecipesParsed);
writeObjectsToJson("categories", categoriesParsed);

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
                    buffsParsed[newBuff.id] = newBuff;
                    effects.buffs.push(newBuff.id);
                    if (DEBUG) console.log(newBuff);
                }
            }
        }

        item.onConsume = effects;
    }

    // handle production time for necessary items
    let production = [];
    switch (id) {
        //#region preserves jar
        // pickles, jelly, aged roe
        case "342":
        case "344":
        case "447":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.jar,
                4000,
                PROD_UNITS.min,
            ));
            break;
        
        // caviar
        case "445":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.jar,
                6000,
                PROD_UNITS.min,
            ));
            break;
        //#endregion
        
        //#region keg
        // beer
        case "346":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                1750,
                PROD_UNITS.min,
            ));
            break;
        
        // vinegar, mead
        case "419":
        case "459":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                600,
                PROD_UNITS.min,
            ));
            break;
        
        // coffee
        case "395":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                120,
                PROD_UNITS.min,
            ));
            break;
        
        // green tea
        case "614":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                180,
                PROD_UNITS.min,
            ));
            break;
        
        // juice
        case "350":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                6000,
                PROD_UNITS.min,
            ));
            break;
        
        // pale ale
        case "303":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                2250,
                PROD_UNITS.min,
            ));
            break;
        
        // wine
        case "348":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.keg,
                10000,
                PROD_UNITS.min,
            ));
            break;
        //#endregion

        //#region mayonnaise machine
        // mayo, duck mayo, void mayo, dino mayo
        case "306":
        case "307":
        case "308":
        case "807":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.mayo,
                180,
                PROD_UNITS.min,
            ));
            break;
        //#endregion

        //#region cheese press
        // cheese, goat cheese
        case "424":
        case "426":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.cheese,
                200,
                PROD_UNITS.min,
            ));
            break;
        //#endregion

        //#region oil maker
        // truffle oil
        case "432":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.oil,
                360,
                PROD_UNITS.min,
            ));
            break;

        // oil
        case "247":
            production.push(new ProductionSource(
                PROD_SRCS.crops.corn,
                1000,
                PROD_UNITS.min,
            ));
            production.push(new ProductionSource(
                PROD_SRCS.crops.sunflowerSeed,
                3200,
                PROD_UNITS.min,
            ));
            production.push(new ProductionSource(
                PROD_SRCS.crops.sunflower,
                60,
                PROD_UNITS.min,
            ));
            break;
        //#endregion

        //#region loom
        // cloth
        case "428":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.loom,
                240,
                PROD_UNITS.min,
            ));
            break;
        //#endregion

        //#region bee house
        // honey
        case "340":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.bee,
                4,
                PROD_UNITS.night,
            ));
            break;
        //#endregion

        //#region fish smoker
        // smoked fish
        case "SmokedFish":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.smoker,
                50,
                PROD_UNITS.min,
            ));
            break;
        //#endregion

        //#region dehydrator
        // dried mushrooms, dried fruit, raisins
        case "DriedMushrooms":
        case "DriedFruit":
        case "Raisins":
            production.push(new ProductionSource(
                PROD_SRCS.appliances.dehydrate,
                1,
                PROD_UNITS.day,
            ));
            break;
        //#endregion

        //#region coop
        // white egg (lg + sm), brown egg (lg + sm), gold egg, void egg
        case "176":
        case "174":
            production.push(new ProductionSource(
                PROD_SRCS.coop.chxWhite,
                1,
                PROD_UNITS.day,
            ));
            break;
        case "180":
        case "182":
            production.push(new ProductionSource(
                PROD_SRCS.coop.chxBrown,
                1,
                PROD_UNITS.day,
            ));
            break;
        case "928":
            production.push(new ProductionSource(
                PROD_SRCS.coop.chxGold,
                1,
                PROD_UNITS.day,
            ));
            break;
        case "305":
            production.push(new ProductionSource(
                PROD_SRCS.coop.chxVoid,
                1,
                PROD_UNITS.day,
            ));
            break;
        
        // duck egg, duck feather
        case "442":
        case "444":
            production.push(new ProductionSource(
                PROD_SRCS.coop.duck,
                2,
                PROD_UNITS.day,
            ));
            break;
        
        // rabbit foot
        case "446":
            production.push(new ProductionSource(
                PROD_SRCS.coop.rabbit,
                4,
                PROD_UNITS.day,
            ));
            break;
        
        // dinosaur egg
        case "107":
            production.push(new ProductionSource(
                PROD_SRCS.coop.dino,
                7,
                PROD_UNITS.day,
            ));
            break;
        //#endregion

        //#region barn
        // milk, large milk, truffle
        case "184":
        case "186":
            production.push(new ProductionSource(
                PROD_SRCS.barn.cow,
                1,
                PROD_UNITS.day,
            ));
            break;
        case "430":
            production.push(new ProductionSource(
                PROD_SRCS.barn.pig,
                1,
                PROD_UNITS.day,
            ));
            break;
        
        // goat milk, large goat milk
        case "436":
        case "438":
            production.push(new ProductionSource(
                PROD_SRCS.barn.goat,
                2,
                PROD_UNITS.day,
            ));
            break;
        
        // wool (sheep + rabbit)
        case "440":
            production.push(new ProductionSource(
                PROD_SRCS.barn.sheep,
                3,
                PROD_UNITS.day,
            ));
            production.push(new ProductionSource(
                PROD_SRCS.coop.rabbit,
                4,
                PROD_UNITS.day,
            ));
            break;
        
        // ostrich egg
        case "289":
            production.push(new ProductionSource(
                PROD_SRCS.barn.ostrich,
                7,
                PROD_UNITS.day,
            ));
            break;
        //#endregion
    }
    if (production.length !== 0) {
        item.productionTime = production;
    }

    // add new object to storage
    objectsParsed[id] = item;
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

    buffsParsed[id] = buff;
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
    
    cropsParsed[id] = crop;
    if (DEBUG) console.log(crop);
}

/**
 * Process a fruit tree from the FruitTrees data file.
 * @param {string} id fruit tree ID
 * @param {any} obj fruit tree data object
 */
function processFruitTree(id, obj) {
    // create base fruit tree
    const tree = new FruitTree(
        id,
        obj.Seasons.map((season) => season.toLowerCase()),
        obj.Fruit[0].ItemId.split(")").pop()    // split off possible "(O)" prefix
    );

    fruitTreesParsed[id] = tree;
    if (DEBUG) console.log(tree);
}

/**
 * Process a cooking recipe from the CookingRecipes data file.
 * @param {string} recipeName recipe name
 * @param {string} recipeString recipe string
 */
function processCookingRecipe(recipeName, recipeString) {
    const recipePieces = recipeString.split("/");             // slash-delimited

    // parse ingredients
    const ingredientList = recipePieces[0].split(" ");  // first field is ingredients, space-delimited
    const ingredients = {};
    for (let i = 0; i < ingredientList.length - 1; i += 2) {
        ingredients[ingredientList[i]] = Number(ingredientList[i + 1]);
    }

    // recipePieces[1] is unused

    // parse yield
    const recipeYield = recipePieces[2];                // third field is ID of yielded item

    // create CookingRecipe
    const recipe = new CookingRecipe(
        recipeName,
        ingredients,
        recipeYield
    );

    // parse source
    const source = recipePieces[3];                     // fourth field is source string
    // only add source if it's default, a friendship unlock, or a skill unlock
    // skip "Luck" skill unlocks, as this is not a skill that can actually be leveled up
    // the rest will be parsed later from other files
    if (source === "default" ||
        source[0] === "f" ||
        (source[0] === "s" && source.split(" ")[1] !== "Luck")) {
        recipe.unlockSources.push(source);
    }

    if (DEBUG) console.log(recipe);
    cookingRecipesParsed[recipeName] = recipe;
}

/**
 * Process an episode of Queen of Sauce source.
 * @param {string} id channel program ID
 * @param {string} showInfo TV show info
 */
function processTVRecipeSource(id, showInfo) {
    // calculate day of season
    // start by getting Sunday number 1-4
    // subtract 1, mod 4, and add 1 to get 1-4
    // since episode IDs start at 1, not 0
    const numSunday = ((id - 1) % 4) + 1;
    // now multiply by 7 to get day of season
    const day = numSunday * 7;

    // calculate season
    // start by subtracting 1 then dividing by 4 (number of Sundays in a season)
    // and floor to create season buckets
    const seasonBucket = Math.floor((id - 1) / 4);
    // then mod 4 and add 1 to get 1-4
    const seasonNum = (seasonBucket % 4) + 1;
    // and finally map to season name
    const season = SEASONS[seasonNum];

    // calculate year
    // start by subtracting 1 then dividing by 16 (number of Sundays in a year)
    // and floor to create year buckets
    const yearBucket = Math.floor((id - 1) / 16);
    // then mod 16 and add 1 to get year
    const year = (yearBucket % 16) + 1;

    // parse recipe name, always first field in the show info
    const recipeName = showInfo.split("/")[0];

    // assemble unlock string and set into recipe
    const unlock = `q ${day} ${season} ${year}`;
    
    if (DEBUG) console.log(`Setting ${unlock} into recipe ${recipeName}`);
    if (recipeName in cookingRecipesParsed) {
        cookingRecipesParsed[recipeName].unlockSources.push(unlock);
    }
}

/**
 * Process a list of special recipe sources for a given recipe.
 * @param {string} name recipe name
 * @param {string[]} sources array of sources for the recipe
 */
function processSpecialRecipeSource(name, sources) {
    if (DEBUG) console.log("Setting", sources, "into recipe", name);
    if (name in cookingRecipesParsed) {
        cookingRecipesParsed[name].unlockSources = [
            ...cookingRecipesParsed[name].unlockSources,
            ...sources
        ];
    }
}

/**
 * Process custom category setup.
 * Updates objects with appropriate categories and sub-categories, and builds
 * the parsed category index.
 */
function processCategories() {
    categoriesParsed = {
        primary: {
            "1": new Category(
                "1",
                "crops",
                "Crops",
                "",
            ),
            "2": new Category(
                "2",
                "fruitTrees",
                "Fruit Trees",
                "",
            ),
            "3": new Category(
                "3",
                "flowers",
                "Flowers",
                "",
            ),
            "4": new Category(
                "4",
                "forage",
                "Forageables",
                "",
            ),
            "5": new Category(
                "5",
                "syrups",
                "Syrups",
                "",
            ),
            "6": new Category(
                "6",
                "animalProducts",
                "Animal Products",
                "",
            ),
            "7": new Category(
                "7",
                "fish",
                "Fish",
                "",
            ),
            "8": new Category(
                "8",
                "artisanGoods",
                "Artisan Goods",
                "",
            ),
            "9": new Category(
                "9",
                "cooking",
                "Cooking Recipes",
                "",
            ),
        },

        secondary: {
            // perk sub-categories
            "100": new Category(
                "100",
                "tiller",
                "Tiller",
            ),
            "101": new Category(
                "101",
                "rancher",
                "Rancher",
            ),
            "102": new Category(
                "102",
                "artisan",
                "Artisan",
            ),
            "103": new Category(
                "103",
                "tapper",
                "Tapper",
            ),
            "104": new Category(
                "104",
                "fisherAngler",
                "Fisher and Angler",
            ),
            "105": new Category(
                "105",
                "gemologist",
                "Gemologist",
            ),
            "106": new Category(
                "106",
                "blacksmith",
                "Blacksmith",
            ),

            // functional sub-categories
            "200": new Category(
                "200",
                "vegetable",
            ),
            "201": new Category(
                "201",
                "wheat",
            ),
            "202": new Category(
                "202",
                "hops",
            ),
            "203": new Category(
                "203",
                "tea",
            ),
            "210": new Category(
                "210",
                "fruit",
            ),
            "211": new Category(
                "211",
                "grape",
            ),
            "220": new Category(
                "220",
                "producesHoney",
            ),
            "-5": new Category(
                "-5",
                "eggs",
            ),
            "-6": new Category(
                "-6",
                "milk",
            ),
        },
    };

    for (const id in objectsParsed) {
        const item = objectsParsed[id];
        const subCats = [];

        switch (item.category) {
            // Vegetables
            case -75:
                // all vegetables are affected by Tiller
                subCats.push(100)

                // all vegetables can be processed
                subCats.push(200)

                // check for processing overrides
                switch (item.id) {
                    // wheat
                    case "262":
                        subCats.push(201);
                        break;
                    
                    // hops
                    case "304":
                        subCats.push(202);
                        break;
                    
                    // tea
                    case "815":
                        subCats.push(203);
                        break;

                    default:
                        break;
                }

                // set all to crops main category, except fiddlehead fern
                if (item.id === "259") {
                    item.category = 4;
                } else {
                    item.category = 1;
                }
                
                break;
            
            // Fruits
            case -79:
                // handle non-foraged fruits
                if (
                    // blackberry
                    item.id !== "410" &&
                    // coconut
                    item.id !== "88" &&
                    // crystal fruit
                    item.id !== "414" &&
                    // salmonberry
                    item.id !== "296" &&
                    // spice berry
                    item.id !== "396" &&
                    // wild plum
                    item.id !== "406"
                ) {
                    // all non-foraged fruits are affected by Tiller
                    subCats.push(100);
                    
                    // set fruit tree fruits to fruit tree category
                    if (Object.values(fruitTreesParsed).find((tree) => tree.fruitId === item.id)) {
                        item.category = 2;
                    }
                    // and non-tree crops to crops category
                    else {
                        item.category = 1;
                    }
                } else {
                    // set foraged fruits to forage primary category
                    item.category = 4;
                }

                // all fruits can be processed
                subCats.push(210);

                // check for processing overrides
                // only grapes as of now
                if (item.id === "398") {
                    subCats.push(211);
                }

                break;
            
            // Sell at Pierre's
            case -17:
                // handle sweet gem berry and truffle
                // sweet gem berry
                if (item.id === "417") {
                    // crop category
                    item.category = 1;

                    // no other special options
                }
                // truffle
                else if (item.id === "430") {
                    // animal goods category
                    item.category = 6;

                    // no other special options
                }

                break;
            
            // Flowers
            case -80:
                // all flowers are affected by Tiller, including foraged
                subCats.push(100);

                // handle non-foraged flowers
                if (item.id !== "418" && item.id !== "402") {
                    // all planted flowers make honey
                    subCats.push(220);

                    // all planted flowers are flower category
                    item.category = 3;
                }
                // crocus and sweet pea
                else {
                    // foraged are forage category
                    item.category = 4;
                }
                
                break;
            
            // Sell at Willy's (fish shop)
            case -23:
                // all but roe and squid ink are forage
                // TODO: figure out what to do about roe
                if (item.id !== "812" && item.id !== "814") {
                    item.category = 4;
                }

                break;
            
            // Greens (forage)
            case -81:
                // all but sap are forage category
                if (item.id !== "92") {
                    item.category = 4;
                }
                // sap is syrup category
                else {
                    item.category = 5;
                }

                break;
            
            // Syrup
            case -27:
                // all are affected by Artisan
                subCats.push(102);

                // all are syrup category
                item.category = 5;

                break;
            
            // Eggs
            case -5:
                // all are affected by Rancher
                subCats.push(101);

                // all are eggs for recipes
                subCats.push(-5);

                // all are animal goods category
                item.category = 6;

                break;
            
            // Milk
            case -6:
                // all are affected by Rancher
                subCats.push(101);

                // all are milk for recipes
                subCats.push(-6);

                // all are animal goods category
                item.category = 6;

                break;
            
            // Sell at Pierre's and Marnie's
            case -18:
                // all are affected by Rancher
                subCats.push(101);

                // all are animal goods category
                item.category = 6;

                break;
            
            // Fish
            case -4:
                // all are affected by Fisher and Angler
                subCats.push(104);

                // all are fish category
                item.category = 7;

                break;
            
            // Artisan Goods
            case -26:
                // all are affected by Artisan
                subCats.push(102);

                // set artisan goods category for all except generics
                if (
                    // jelly
                    item.id !== "344" &&
                    // pickles
                    item.id !== "342" &&
                    // wine
                    item.id !== "348" &&
                    // juice
                    item.id !== "350" &&
                    // honey
                    item.id !== "340" &&
                    // aged roe
                    item.id !== "447" &&
                    // dried fruit
                    item.id !== "DriedFruit" &&
                    // dried mushrooms
                    item.id !== "DriedMushrooms" &&
                    // smoked fish
                    item.id !== "SmokedFish"
                ) {
                    item.category = 8;
                }

                break;

            default:
                break;
        }

        // add parsed sub-categories
        if (subCats.length !== 0) {
            item.subCategories = subCats;
        }
    }
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
    if (typeof objVals[0] !== "object") return;
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