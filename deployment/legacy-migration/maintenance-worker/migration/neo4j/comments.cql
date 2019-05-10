CALL apoc.load.json('file:/tmp/mongo-export/splits/current-chunk.json') YIELD value as json

MERGE (comment:Comment {id: json._id["$oid"]})
ON CREATE SET
comment.content        = json.content,
comment.contentExcerpt = json.contentExcerpt,
comment.deleted        = json.deleted,
comment.disabled       = false
WITH comment, json, json.contributionId as postId
MATCH (post:Post {id: postId})
WITH comment, post, json.userId as userId
MATCH (author:User {id: userId})
MERGE (comment)-[:COMMENTS]->(post)
MERGE (author)-[:WROTE]->(comment)
;
