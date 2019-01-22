CALL apoc.load.json('file:/mongo-export/comments.json') YIELD value as comment
MERGE (c:Comment {id: comment._id["$oid"]})
ON CREATE SET
c.content        = comment.content,
c.contentExcerpt = comment.contentExcerpt,
c.deleted        = comment.deleted,
c.disabled       = false
WITH comment
MATCH (p:Post {id: comment.contributionId}), (u:User {id: comment.userId})
MERGE (c)-[:COMMENTS]->(p)
MERGE (u)-[:WROTE]->(c)
;
