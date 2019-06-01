/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[?]   userId: {
[X]     type: String,
[ ]     required: true, // Not required in Nitro
[-]     index: true
      },
[?]   foreignId: {
[X]     type: String,
[ ]     required: true, // Not required in Nitro
[-]     index: true
      },
[?]   foreignService: { // db.getCollection('shots').distinct('foreignService') returns 'contributions'
[X]     type: String,
[ ]     required: true, // Not required in Nitro
[-]     index: true
      },
[ ]   createdAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   wasSeeded: { type: Boolean }
    }
    index:
[?] { userId: 1, foreignId: 1 },{ unique: true } // is the unique constrain modeled?
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as shout
MATCH (u:User {id: shout.userId}), (p:Post {id: shout.foreignId})
MERGE (u)-[:SHOUTED]->(p)
;
