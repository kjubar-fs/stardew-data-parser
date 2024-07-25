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