/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 2:16:39 PM
 *  Last update: 5 Sep 2024, 2:31:41 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
export class Item {
    id;
    nameInternal;
    name;
    description;
    type;
    category;
    spriteIndex;
    texture = "springobjects";
    price = 0;
    onConsume;

    /**
     * Create a new Item object.
     * @param {string} id item ID
     * @param {string} nameInternal internal game name
     * @param {string} name display name (en-US)
     * @param {string} description item description (en-US)
     * @param {string} type item type
     * @param {number} category item category
     * @param {string} texture texture directory for item sprite
     * @param {number} spriteIndex index of sprite in texture directory
     */
    constructor(
        id, nameInternal, name, description, type, category, spriteIndex
    ) {
        this.id = id;
        this.nameInternal = nameInternal;
        this.name = name;
        this.description = description;
        this.type = type;
        this.category = category;
        this.spriteIndex = spriteIndex;
    }
}

export class ConsumptionEffects {
    energy;
    health;
    buffs;

    /**
     * Create a new ConsumptionEffects.
     * @param {number} energy energy restored
     * @param {number} health health restored
     */
    constructor(energy, health) {
        this.energy = energy;
        this.health = health;
    }
}

export class Buff {
    id;
    name;
    duration;
    spriteIndex;
    isDebuff = false;
    effects;
    description;

    /**
     * Create a new Buff.
     * @param {string} id buff ID
     * @param {string} name display name (en-US)
     * @param {number} duration buff duration
     * @param {number} spriteIndex index of sprite in texture directory
     */
    constructor(id, name, duration, spriteIndex) {
        this.id = id;
        this.name = name;
        this.duration = duration;
        this.spriteIndex = spriteIndex;
    }
}

export class Crop {
    id;
    seasons;
    growthDays;
    harvestItemId;
    spriteIndex;
    onTrellis = false;
    paddyCrop = false;
    regrowthDays;
    extraHarvestChance;
    minHarvest;
    maxHarvest;
    noWater;
    scytheHarvest;

    /**
     * Create a new Crop.
     * @param {string} id crop ID
     * @param {string[]} seasons growth seasons
     * @param {number} growthDays number of days to grow fully
     * @param {string} harvestItemId object ID of item given when harvesting
     * @param {number} spriteIndex index of sprite in texture directory
     */
    constructor(id, seasons, growthDays, harvestItemId, spriteIndex) {
        this.id = id;
        this.seasons = seasons;
        this.growthDays = growthDays;
        this.harvestItemId = harvestItemId;
        this.spriteIndex = spriteIndex;
    }
}

export class FruitTree {
    id;
    seasons;
    fruitId;

    /**
     * Create a new FruitTree.
     * @param {string} id fruit tree ID
     * @param {string[]} seasons produce seasons
     * @param {string} fruitId object ID of fruit given when harvesting
     */
    constructor(id, seasons, fruitId) {
        this.id = id;
        this.seasons = seasons;
        this.fruitId = fruitId;
    }
}

export class CookingRecipe {
    name;
    ingredients;
    recipeYield;
    unlockSources = [];

    /**
     * Create a new CookingRecipe.
     * @param {string} name recipe name
     * @param {object} ingredients a [string: number] object containing ingredient IDs (or category IDs) and quantity
     * @param {string} recipeYield internal ID of item crafted
     */
    constructor(name, ingredients, recipeYield) {
        this.name = name;
        this.ingredients = ingredients;
        this.recipeYield = recipeYield;
    }
}

export class ProductionSource {
    source;
    time;
    unit;

    /**
     * Create a new ProductionSource.
     * @param {string} source production source, enum value from PROD_SRCS
     * @param {number} time time to produce
     * @param {string} unit production time unit, enum value from PROD_UNITS
     */
    constructor(source, time, unit) {
        this.source = source;
        this.time = time;
        this.unit = unit;
    }
}

export class Category {
    id;
    name;
    displayName;
    iconPath;

    /**
     * Create a new Category.
     * @param {string} id category ID
     * @param {string} name category internal name
     * @param {string} displayName category display name
     * @param {string} iconPath path to category icon
     */
    constructor(id, name, displayName, iconPath) {
        this.id = id;
        this.name = name;
        if (displayName) this.displayName = displayName;
        if (iconPath) this.iconPath = iconPath;
    }
}