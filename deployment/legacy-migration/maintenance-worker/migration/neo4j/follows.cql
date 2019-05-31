/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[?]   userId: {
[-]     type: String,
[ ]     required: true,
[-]     index: true
      },
[?]   foreignId: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[?]   foreignService: { // db.getCollection('follows').distinct('foreignService') returns 'organizations' and 'users'
[ ]     type: String,
[ ]     required: true,
[ ]     index: true
      },
[ ]   createdAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   wasSeeded: { type: Boolean }
    }
    index:
[?] { userId: 1, foreignId: 1, foreignService: 1 },{ unique: true } // is the unique constrain modeled?
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as follow
MATCH (u1:User {id: follow.userId}), (u2:User {id: follow.foreignId})
MERGE (u1)-[:FOLLOWS]->(u2)
;
