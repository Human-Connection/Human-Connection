/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   email: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true,
[ ]     unique: true
      },
[ ]   code: {
[ ]     type: String,
[-]     index: true,
[ ]     required: true
      },
[ ]   role: {
[ ]     type: String,
[ ]     enum: ['admin', 'moderator', 'manager', 'editor', 'user'],
[ ]     default: 'user'
      },
[ ]   invitedByUserId: { type: String },
[ ]   language: { type: String },
[ ]   badgeIds: [],
[ ]   wasUsed: {
[ ]     type: Boolean,
[-]     index: true
      },
[ ]   createdAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   wasSeeded: { type: Boolean }
  }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as invite;
