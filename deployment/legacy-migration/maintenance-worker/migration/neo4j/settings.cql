/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   key: {
[ ]     type: String,
[ ]     default: 'system',
[-]     index: true,
[ ]     unique: true
      },
[ ]   invites: {
[ ]     userCanInvite: {
[ ]       type: Boolean,
[ ]       required: true,
[ ]       default: false
        },
[ ]     maxInvitesByUser: {
[ ]       type: Number,
[ ]       required: true,
[ ]       default: 1
        },
[ ]     onlyUserWithBadgesCanInvite: {
[ ]       type: Array,
[ ]       default: []
        }
      },
[ ]   maintenance: false
    }, {
[ ]   timestamps: true
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as setting;
