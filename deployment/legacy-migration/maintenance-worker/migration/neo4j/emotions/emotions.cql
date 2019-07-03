/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   userId: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   contributionId: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   rated: {
[ ]     type: String,
[ ]     required: true,
[ ]     enum: ['funny', 'happy', 'surprised', 'cry', 'angry']
      },
[ ]   createdAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   updatedAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   wasSeeded: { type: Boolean }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as emotion;
