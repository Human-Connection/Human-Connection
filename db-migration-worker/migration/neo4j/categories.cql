CALL apoc.load.json('file:/mongo-export/categories.json') YIELD value as category
MERGE(c:Category {id: category._id["$oid"]})
ON CREATE SET
c.name      = category.title,
c.slug      = category.slug,
c.icon      = category.icon,
c.createdAt = category.createdAt.`$date`,
c.updatedAt = category.updatedAt.`$date`
;

MATCH (c:Category)
WHERE (c.icon = "categories-justforfun")
SET c.icon = 'smile'
;

MATCH (c:Category)
WHERE (c.icon = "categories-luck")
SET c.icon = 'heart-o'
;

MATCH (c:Category)
WHERE (c.icon = "categories-health")
SET c.icon = 'medkit'
;

MATCH (c:Category)
WHERE (c.icon = "categories-environment")
SET c.icon = 'tree'
;

MATCH (c:Category)
WHERE (c.icon = "categories-animal-justice")
SET c.icon = 'paw'
;

MATCH (c:Category)
WHERE (c.icon = "categories-human-rights")
SET c.icon = 'balance-scale'
;

MATCH (c:Category)
WHERE (c.icon = "categories-education")
SET c.icon = 'graduation-cap'
;

MATCH (c:Category)
WHERE (c.icon = "categories-cooperation")
SET c.icon = 'users'
;

MATCH (c:Category)
WHERE (c.icon = "categories-politics")
SET c.icon = 'university'
;

MATCH (c:Category)
WHERE (c.icon = "categories-economy")
SET c.icon = 'money'
;

MATCH (c:Category)
WHERE (c.icon = "categories-technology")
SET c.icon = 'flash'
;

MATCH (c:Category)
WHERE (c.icon = "categories-internet")
SET c.icon = 'mouse-pointer'
;

MATCH (c:Category)
WHERE (c.icon = "categories-art")
SET c.icon = 'paint-brush'
;

MATCH (c:Category)
WHERE (c.icon = "categories-freedom-of-speech")
SET c.icon = 'bullhorn'
;

MATCH (c:Category)
WHERE (c.icon = "categories-sustainability")
SET c.icon = 'shopping-cart'
;

MATCH (c:Category)
WHERE (c.icon = "categories-peace")
SET c.icon = 'angellist'
;
