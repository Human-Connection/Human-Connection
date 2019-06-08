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
[?]   contributionId: {
[X]     type: String,
[ ]     required: true, // Not required in Nitro
[-]     index: true
      },
[X]   content: {
[X]     type: String,
[X]     required: true
      },
[?]   contentExcerpt: { // Generated from content
[X]     type: String,
[ ]     required: true // Not required in Nitro
      },
[ ]   hasMore: { type: Boolean },
[ ]   upvotes: {
[ ]     type: Array,
[ ]     default: []
      },
[ ]   upvoteCount: {
[ ]     type: Number,
[ ]     default: 0
      },
[?]   deleted: {
[X]     type: Boolean,
[ ]     default: false, // Default value is missing in Nitro
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
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as comment
MERGE (c:Comment {id: comment._id["$oid"]})
ON CREATE SET
c.content        = comment.content,
c.contentExcerpt = comment.contentExcerpt,
c.deleted        = comment.deleted,
c.disabled       = false
WITH c, comment, comment.contributionId as postId
MATCH (post:Post {id: postId})
WITH c, post, comment.userId as userId
MATCH (author:User {id: userId})
MERGE (c)-[:COMMENTS]->(post)
MERGE (author)-[:WROTE]->(c)
;
