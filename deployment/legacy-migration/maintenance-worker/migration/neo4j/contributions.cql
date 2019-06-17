/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
[?] { //Modeled incorrect as Post
[?]   userId: {
[X]     type: String,
[ ]     required: true, // Not required in Nitro
[-]     index: true
      },
[ ]   organizationId: {
[ ]     type: String,
[-]     index: true
      },
[X]   categoryIds: {
[X]     type: Array,
[-]     index: true
      },
[X]   title: {
[X]     type: String,
[X]     required: true
      },
[?]   slug: { // Generated from title
[X]     type: String,
[ ]     required: true, // Not required in Nitro
[?]     unique: true, // Unique value is not enforced in Nitro?
[-]     index: true
      },
[ ]   type: { // db.getCollection('contributions').distinct('type') -> 'DELETED', 'cando', 'post'
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   cando: {
[ ]     difficulty: {
[ ]       type: String,
[ ]       enum: ['easy', 'medium', 'hard']
        },
[ ]     reasonTitle: { type: String },
[ ]     reason: { type: String }
      },
[X]   content: {
[X]     type: String,
[X]     required: true
      },
[?]   contentExcerpt: { // Generated from content
[X]     type: String,
[?]     required: true // Not required in Nitro
      },
[ ]   hasMore: { type: Boolean },
[X]   teaserImg: { type: String },
[ ]   language: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   shoutCount: {
[ ]     type: Number,
[ ]     default: 0,
[-]     index: true
      },
[ ]   meta: {
[ ]     hasVideo: {
[ ]       type: Boolean,
[ ]       default: false
        },
[ ]     embedds: {
[ ]       type: Object,
[ ]       default: {}
        }
      },
[?]   visibility: {
[X]     type: String,
[X]     enum: ['public', 'friends', 'private'],
[ ]     default: 'public', // Default value is missing in Nitro
[-]     index: true
      },
[?]   isEnabled: {
[X]     type: Boolean,
[ ]     default: true, // Default value is missing in Nitro
[-]     index: true
      },
[?]   tags: { type: Array }, // ensure this is working properly
[ ]   emotions: {
[ ]     type: Object,
[-]     index: true,
[ ]     default: {
[ ]       angry: {
[ ]         count: 0,
[ ]         percent: 0
[ ]       },
[ ]       cry: {
[ ]         count: 0,
[ ]         percent: 0
[ ]       },
[ ]       surprised: {
[ ]         count: 0,
[ ]         percent: 0
          },
[ ]       happy: {
[ ]         count: 0,
[ ]         percent: 0
          },
[ ]       funny: {
[ ]         count: 0,
[ ]         percent: 0
          }
        }
      },
[?]   deleted: {
[X]     type: Boolean,
[ ]     default: false, // Default value is missing in Nitro
[-]     index: true
      },
[?]   createdAt: {
[?]     type: Date, // Type is modeled as string in Nitro which is incorrect
[ ]     default: Date.now // Default value is missing in Nitro
      },
[?]   updatedAt: {
[?]     type: Date, // Type is modeled as string in Nitro which is incorrect
[ ]     default: Date.now // Default value is missing in Nitro
      },
[ ]   wasSeeded: { type: Boolean }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as post
MERGE (p:Post {id: post._id["$oid"]})
ON CREATE SET
p.title          = post.title,
p.slug           = post.slug,
p.image          = replace(post.teaserImg, 'https://api-alpha.human-connection.org', ''),
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
MERGE (t:Tag {id: tag, name: tag})
MERGE (p)-[:TAGGED]->(t)
;
