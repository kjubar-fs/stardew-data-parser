/*
 *  Author: Kaleb Jubar
 *  Created: 29 Jul 2024, 2:16:39 PM
 *  Last update: 29 Jul 2024, 3:29:31 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
export class Item {
    id;
    nameInternal;
    name;
    description;
    type;
    category;
    texture;
    spriteIndex;
    price = 0;
    onConsume = null;

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
        id, nameInternal, name, description, type, category,
        texture, spriteIndex
    ) {
        this.id = id;
        this.nameInternal = nameInternal;
        this.name = name;
        this.description = description;
        this.type = type;
        this.category = category;
        this.texture = texture;
        this.spriteIndex = spriteIndex;
    }
}

export class ConsumptionEffects {
    energy;
    health;
    buffs = null;

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
    name;
    duration;
    spriteIndex;
    isDebuff = false;
    effects = {};
    description = null;

    /**
     * Create a new Buff.
     * @param {string} name display name (en-US)
     * @param {number} duration buff duration
     * @param {number} spriteIndex index of sprite in texture directory
     */
    constructor(name, duration, spriteIndex) {
        this.name = name;
        this.duration = duration;
        this.spriteIndex = spriteIndex;
    }
}