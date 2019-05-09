CALL apoc.load.json('file:/tmp/mongo-export/splits/current-chunk.json') YIELD value as user
MERGE(u:User {id: user._id["$oid"]})
ON CREATE SET
u.name       = user.name,
u.slug       = user.slug,
u.email      = user.email,
u.password   = user.password,
u.avatar     = user.avatar,
u.coverImg   = user.coverImg,
u.wasInvited = user.wasInvited,
u.role       = toLower(user.role),
u.createdAt  = user.createdAt.`$date`,
u.updatedAt  = user.updatedAt.`$date`,
u.deleted    = user.deletedAt IS NOT NULL,
u.disabled   = false
WITH u, user, user.badgeIds AS badgeIds
UNWIND badgeIds AS badgeId
MATCH (b:Badge {id: badgeId})
MERGE (b)-[:REWARDED]->(u)
;
