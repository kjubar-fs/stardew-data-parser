## TODOs and keep in mind
### Data files to do
- TV/CookingChannel.json
- SpecialRecipeSources.json
- CookingRecipes.json
- FruitTrees.json

### Manual data entry
- boots sprite indices
- animal production times
- fruit tree grow times
- recipe sources (for non-friendship)
- remove lantern from tools
- cactus fruit can only be planted outside on Ginger Island
- ancient fruit can't be grown in planter pots
- fiber and qi fruit can't be any quality but normal

### Special handling
- some localized string tags use more than 2 `/`s
- tool sprite should use `MenuSpriteIndex` if exists, then fall back to `SpriteIndex`
- parsing for queries in locations for fish
- positive fractions are rounded down (`Math.floor`), negative fractions are rounded up (`Math.ceil`)
- paddy crops' grow time is multiplied by 0.75 when irrigated
- rice shoots give 2 rice 50% of the time at farming 0, and 3 rice 50% of the time at farming 10

## Data Structures
The data structures output by this tool.

### Objects
#### Non-optional:
- `id` - internal item ID
- `nameInternal` - internal item name
- `name` - display name (en-US)
- `description` - item description (en-US)
- `type` - item type
    - `litter`
    - `basic`
    - `minerals`
    - `quest`
    - `asdf`
    - `crafting`
    - `arch`
    - `fish`
    - `cooking`
    - `seeds`
    - `ring`
    - `interactive`
- `category` - item category
    - see https://stardewvalleywiki.com/Modding:Items#Categories
- `texture` - directory containing the item's sprite
- `spriteIndex` - index of sprite in the sprite directory
- `price` - sale price of item when sold to merchants

#### Optional:
- `onConsume` - an object with the effects when the item is consumed
    - `energy` - energy restored
    - `health` - health restored
    - `buffs` - (optional) array of IDs of buffs added

### Buffs
#### Non-optional:
- `id` - internal buff ID, will be `food_<FoodID>` if it is a custom buff from a food item
- `name` - display name (en-US)
- `duration` - buff duration
- `spriteIndex` - index of sprite in the sprite directory
- `isDebuff` - `true` if the buff is actually a debuff
- `effects` - a [string: number] object where the key is a stat name and the value is the adjustment amount

#### Optional:
- `description` - buff description (en-US)

### Crops
#### Non-optional:
- `id` - internal crop ID
- `seasons` - array of seasons this crop will grow in
    - `spring`
    - `summer`
    - `fall`
    - `winter`
- `growthDays` - number of days for crop to grow, will be the initial growth time for regrowing crops
- `harvestItemId` - internal ID of item harvested from this crop
- `spriteIndex` - index of sprite in the sprite directory
- `onTrellis` - `true` if the crop grows on an unpassable trellis
- `paddyCrop` - `true` if the crop can be irrigated to grow faster

#### Optional:
- `regrowthDays` - number of days for the crop to regrow
- `extraHarvestChance` - chance of harvesting additional crops
- `minHarvest` - minimum number harvested
- `maxHarvest` - maximum number harvested
- `noWater` - `true` if this crop doesn't need to be watered
- `scytheHarvest` - `true` if this crop is harvested with a scythe instead of by hand

### Fruit Trees
#### Non-optional:
- `id` - internal tree ID
- `seasons` - array of seasons this tree will produce fruit in (no trees produce in winter)
    - `spring`
    - `summer`
    - `fall`
- `fruitId` - internal ID of item harvested from this tree

#### Optional:
- none

### Cooking Recipes
#### Non-optional:
- `name` - recipe name
- `ingredients` - a [string: number] object where the key is an internal item ID and the value is the quantity
- `yield` - internal ID of item crafted by this recipe
- `unlockConditions` - array of condition strings for unlocking this recipe
    - `default` - unlocked by default
    - `f <NPC> <hearts>` - unlocked via mail at `hearts` heart level with `NPC`
    - `b <location> <price>_<item>` - purchased from `location` for `price`; if `item` is provided, it is the internal ID of the item used to purchase rather than gold
    - `e <NPC> <hearts>` - unlocked during `NPC`'s `hearts` heart event
    - `q <day> <season> <year>` - unlocked via Queen of Sauce on TV on `day` of `season` in `year`

#### Optional:
- none

## To add later

### Tools
#### Fields
Non-optional:
- `id` - internal tool ID
- `nameInternal` - internal tool name
- `name` - display name (en-US)
- `description` - tool description (en-US)
- `spriteIndex` - integer index of the sprite; from raw data, this will be `MenuSpriteIndex` if it exists, otherwise it will be `SpriteIndex`

Optional:
- `attachments` - an object with the number of bait and tackle slots (fishing rods only)
    - `bait` - number of bait slots
    - `tackle` - number of tackle slots
