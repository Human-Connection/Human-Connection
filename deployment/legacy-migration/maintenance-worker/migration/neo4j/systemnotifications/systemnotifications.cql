/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   type: {
[ ]     type: String,
[ ]     default: 'info',
[ ]     required: true,
[-]     index: true
      },
[ ]   title: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   content: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   slot: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   language: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   permanent: {
[ ]     type: Boolean,
[ ]     default: false
      },
[ ]   requireConfirmation: {
[ ]     type: Boolean,
[ ]     default: false
      },
[ ]   active: {
[ ]     type: Boolean,
[ ]     default: true,
[-]     index: true
      },
[ ]   totalCount: {
[ ]     type: Number,
[ ]     default: 0
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

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as systemnotification;
