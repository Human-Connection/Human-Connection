# Import

For importing Data we need to set some values in the Neo4J config.

### Neo4J Config

{% hint style="danger" %}
Do not leave this settings on the production environment
{% endhint %}

```yaml
dbms.security.procedures.unrestricted=apoc.*
apoc.import.file.enabled=true
```

### Data import from Mongodumbs

```bash
EXPORT MONGO COLLECTIONS AS mongodump

### Categories

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.categories.json') YIELD value as category
MERGE(c:Category {id: category._id["$oid"]})
ON CREATE SET 	c.name 	= category.title,
				c.slug	= category.slug,
				c.icon	= category.icon

-- 
CREATE CONSTRAINT ON (c:Category) ASSERT c.id IS UNIQUE
CREATE CONSTRAINT ON (c:Category) ASSERT c.name IS UNIQUE
CREATE CONSTRAINT ON (c:Category) ASSERT c.slug IS UNIQUE


### Badges

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.badges.json') YIELD value as badge
MERGE(b:Badge {id: badge._id["$oid"]})
ON CREATE SET 	b.key 		= badge.key,
				b.type		= badge.type,
				b.icon		= badge.image.path,
				b.status 	= badge.status

-- 
CREATE CONSTRAINT ON (b:Badge) ASSERT b.id IS UNIQUE
CREATE CONSTRAINT ON (b:Badge) ASSERT b.key IS UNIQUE


### Users

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.users.json') YIELD value as user
MERGE(u:User {id: user._id["$oid"]})
ON CREATE SET 	u.name 			= user.name,
				u.slug			= user.slug,
				u.email			= user.email,
				u.password		= user.password,
				u.avatar 		= user.avatar,
    			u.coverImg		= user.coverImg,
    			u.wasInvited	= user.wasInvited,
    			u.role			= apoc.text.toUpperCase(user.role)
WITH u, user, user.badgeIds AS badgeIds
UNWIND badgeIds AS badgeId
MATCH (b:Badge {id: badgeId})
MERGE (b)-[:REWARDED]->(u)

--
CREATE INDEX ON :User(name)
CREATE INDEX ON :User(deleted)
CREATE INDEX ON :User(disabled)
CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE
CREATE CONSTRAINT ON (u:User) ASSERT u.slug IS UNIQUE


### Contributions

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.contributions.json') YIELD value as post
MERGE (p:Post {id: post._id["$oid"]})
ON CREATE SET 	p.title 			= post.title,
				p.slug				= post.slug,
				p.image 			= post.teaserImg,
				p.content			= post.content,
				p.contentExcerpt 	= post.contentExcerpt,
				p.visibility		= apoc.text.toUpperCase(post.visibility),
				p.createdAt 		= datetime(post.createdAt["$date"]),
				p.updatedAt 		= datetime(post.updatedAt["$date"])
WITH p, post, post.tags AS tags, post.categoryIds as categoryIds
UNWIND tags AS tag
UNWIND categoryIds AS categoryId
MATCH (c:Category {id: categoryId}),
	  (u:User {id: post.userId})
MERGE (t:Tag {id: apoc.create.uuid(), name: tag})
MERGE (p)-[:TAGGED]->(t)
MERGE (u)-[:WROTE]->(p)
MERGE (p)-[:CATEGORIZED]->(c)

--
CREATE INDEX ON :Post(title)
CREATE INDEX ON :Post(content)
CREATE INDEX ON :Post(deleted)
CREATE INDEX ON :Post(disabled)
CREATE CONSTRAINT ON (p:Post) ASSERT p.id IS UNIQUE
CREATE CONSTRAINT ON (p:Post) ASSERT p.slug IS UNIQUE


### Coments

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.comments.json') YIELD value as comment
MERGE (c:Comment {id: comment._id["$oid"]})
ON CREATE SET 	c.content			= comment.content,
				c.contentExcerpt 	= comment.contentExcerpt,
				c.deleted			= comment.deleted
MATCH (p:Post {id: comment.contributionId}),
	  (u:User {id: comment.userId})
MERGE (c)-[:COMMENTS]->(p)
MERGE (u)-[:WROTE]->(c)

--
CREATE INDEX ON :Comment(deleted)
CREATE INDEX ON :Comment(disabled)
CREATE CONSTRAINT ON (c:Comment) ASSERT c.id IS UNIQUE


### Follolws

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.follows.json') YIELD value as follow
MATCH (u1:User {id: follow.userId}),
	  (u2:User {id: follow.foreignId})
MERGE (u1)-[:FOLLOWS]->(u2)


### Shouts

CALL apoc.load.json('file:/Users/Greg/Projekte/HumanConnection/_notes/NEO4J-Import/hc_api.shouts.json') YIELD value as shout
MATCH (u:User {id: shout.userId}),
	  (p:Post {id: shout.foreignId})
MERGE (u)-[:SHOUTED]->(p)

```

