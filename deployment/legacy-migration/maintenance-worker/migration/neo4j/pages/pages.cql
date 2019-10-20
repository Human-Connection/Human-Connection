/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   title: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   slug: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   type: {
[ ]     type: String,
[ ]     required: true,
[ ]     default: 'page'
      },
[ ]   key: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   content: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   language: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   active: {
[ ]     type: Boolean,
[ ]     default: true,
[-]     index: true
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
    index:
[ ] { slug: 1, language: 1 },{ unique: true }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as page;
