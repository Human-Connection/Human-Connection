CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL}") YIELD value as post
MERGE (p:Post {id: post._id["$oid"]})
ON CREATE SET
p.title          = post.title,
p.slug           = post.slug,
p.image          = post.teaserImg,
p.content        = post.content,
p.contentExcerpt = post.contentExcerpt,
p.visibility     = toLower(post.visibility),
p.createdAt      = post.createdAt.`$date`,
p.updatedAt      = post.updatedAt.`$date`,
p.deleted        = post.deleted,
p.disabled       = NOT post.isEnabled
WITH p, post
MATCH (u:User {id: post.userId})
MERGE (u)-[:WROTE]->(p)
WITH p, post, post.categoryIds as categoryIds
UNWIND categoryIds AS categoryId
MATCH (c:Category {id: categoryId})
MERGE (p)-[:CATEGORIZED]->(c)
WITH p, post.tags AS tags
UNWIND tags AS tag
MERGE (t:Tag {id: apoc.create.uuid(), name: tag})
MERGE (p)-[:TAGGED]->(t)
;
