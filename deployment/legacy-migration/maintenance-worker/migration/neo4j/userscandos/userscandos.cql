/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   userId: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   contributionId: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   done: {
[ ]     type: Boolean,
[ ]     default: false
      },
[ ]   doneAt: { type: Date },
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
    index:
[ ] { userId: 1, contributionId: 1 },{ unique: true }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as usercando;
