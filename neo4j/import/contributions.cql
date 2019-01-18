CALL apoc.load.json('file:/mongo-export/contributions.json') YIELD value as post
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
WITH p, post, post.tags AS tags, post.categoryIds as categoryIds
UNWIND tags AS tag
UNWIND categoryIds AS categoryId
MATCH (c:Category {id: categoryId}),
   (u:User {id: post.userId})
MERGE (t:Tag {id: apoc.create.uuid(), name: tag})
MERGE (p)-[:TAGGED]->(t)
MERGE (u)-[:WROTE]->(p)
MERGE (p)-[:CATEGORIZED]->(c)
;
