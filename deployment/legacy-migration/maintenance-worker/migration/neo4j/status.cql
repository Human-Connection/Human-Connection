/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   maintenance: {
[ ]     type: Boolean,
[ ]     default: false
      },
[ ]   updatedAt: {
[ ]     type: Date,
[ ]     default: Date.now
      }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as status;
