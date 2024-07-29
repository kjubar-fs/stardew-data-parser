## TODOs and keep in mind
### Manual data entry
- boots sprite indices
- animal production times
- fruit tree grow times
- recipe sources (for non-friendship)
- remove lantern from tools

### Special handling
- some localized string tags use more than 2 `/`s
- tool sprite should use `MenuSpriteIndex` if exists, then fall back to `SpriteIndex`
- parsing for queries in locations for fish

## Data Structures
The data structures output by this tool.

### Objects
#### Fields
Non-optional:
- `id` - internal item ID
- `nameInternal` - internal item name
- `name` - display name (en-US)
- `description` - item description (en-US)
- `type` - item type
    - `Litter`
    - `Basic`
    - `Minerals`
    - `Quest`
    - `asdf`
    - `Crafting`
    - `Arch`
    - `fish`
    - `Cooking`
    - `Seeds`
    - `Ring`
    - `interactive`
- `category` - item category
    - see https://stardewvalleywiki.com/Modding:Items#Categories
- `texture` - directory containing the item's sprite
- `spriteIndex` - index of sprite in the sprite directory
- `price` - sale price of item when sold to merchants

Optional:
- `onConsume` - an object with the effects when the item is consumed
    - `energy` - energy restored
    - `health` - health restored
    - `buffs` - (optional) buffs added

### Tools
#### Fields
Non-optional:
- `id` - internal tool ID
- `nameInternal` - internal tool name
- `name` - display name (en-US)
- `description` - tool description (en-US)
- `spriteIndex` - integer index of the sprite; from raw data, this will be `MenuSpriteIndex` if it exists, otherwise it will be `SpriteIndex`

Optional:
- `attachments` - (fishing rods only) number of bait + tackle slots; 1 = only bait, 2+ = 1 bait + `num` tackle