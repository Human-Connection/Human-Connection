/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   name: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   slug: { type: String },
[ ]   followerIds: [],
[ ]   categoryIds: { type: Array },
[ ]   logo: { type: String },
[ ]   userId: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   description: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   content: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   addresses: {
[ ]     type: Array,
[ ]     default: []
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

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as project;
