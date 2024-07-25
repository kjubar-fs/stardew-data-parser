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