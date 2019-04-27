CALL apoc.load.json('file:/tmp/mongo-export/badges.json') YIELD value as badge
MERGE(b:Badge {id: badge._id["$oid"]})
ON CREATE SET
b.key       = badge.key,
b.type      = badge.type,
b.icon      = badge.image.path,
b.status    = badge.status,
b.createdAt = badge.createdAt.`$date`,
b.updatedAt = badge.updatedAt.`$date`
;
