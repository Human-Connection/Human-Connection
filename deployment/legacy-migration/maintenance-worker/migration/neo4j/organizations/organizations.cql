/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[X]   name: {
[X]     type: String,
[X]     required: true,
[-]     index: true
      },
[?]   slug: {
[X]     type: String,
[X]     required: true,
[?]     unique: true,
[-]     index: true
      },
[-]   followersCounts: {
[-]     users: {
[-]       type: Number,
[-]       default: 0
        },
[-]     organizations: {
[-]       type: Number,
[-]       default: 0
        },
[-]     projects: {
[-]       type: Number,
[-]       default: 0
        }
      },
[-]   followingCounts: {
[-]     users: {
[-]       type: Number,
[-]       default: 0
        },
[-]     organizations: {
[-]       type: Number,
[-]       default: 0
        },
[-]     projects: {
[-]       type: Number,
[-]       default: 0
        }
      },
[X]   categoryIds: {
[X]     type: Array,
[X]     required: true,
[-]     index: true
      },
[X]   logo: { type: String },
[X]   coverImg: { type: String },
[X]   userId: {
[X]     type: String,
[X]     required: true,
[-]     index: true
      },
[X]   description: {
[X]     type: String,
[X]     required: true
      },
[X]   descriptionExcerpt: { type: String }, // will be generated automatically
[ ]   publicEmail: { type: String },
[ ]   url: { type: String },
[X]   type: {
[X]     type: String,
[-]     index: true,
[X]     enum: ['ngo', 'npo', 'goodpurpose', 'ev', 'eva']
      },
[?]   language: {
[X]     type: String,
[X]     required: true,
[?]     default: 'de',
[-]     index: true
      },
[ ]   addresses: {
[ ]     type: [{
[ ]       street: {
[ ]         type: String,
[ ]         required: true
          },
[ ]       zipCode: {
[ ]         type: String,
[ ]         required: true
          },
[ ]       city: {
[ ]         type: String,
[ ]         required: true
          },
[ ]       country: {
[ ]         type: String,
[ ]         required: true
          },
[ ]       lat: {
[ ]         type: Number,
[ ]         required: true
          },
[ ]       lng: {
[ ]         type: Number,
[ ]         required: true
          }
        }],
[ ]     default: []
      },
[?]   createdAt: {
[?]     type: Date,
[?]     default: Date.now
      },
[?]   updatedAt: {
[?]     type: Date,
[?]     default: Date.now
      },
[X]   isEnabled: {
[X]     type: Boolean,
[X]     default: false,
[-]     index: true
      },
[X]   reviewedBy: {
[X]     type: String,
[X]     default: null,
[-]     index: true
      },
[X]   tags: {
[X]     type: Array,
[-]     index: true
      },
[X]   deleted: {
[X]     type: Boolean,
[X]     default: false,
[-]     index: true
      },
[-]   wasSeeded: { type: Boolean }
    }

undocumented: followerIds
db.getCollection('organizations').find({followerIds: {$exists: true, $not: {$size: 0}}}) = zero records
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as organization
MERGE (o:Organization {id: organization._id["$oid"]})
ON CREATE SET
o.name                  = organization.name,
o.slug                  = organization.slug,
o.type                  = organization.type,
o.description           = organization.description,
o.descriptionExcerpt    = organization.descriptionExcerpt,
o.language              = organization.language,
o.avatar                = replace(organization.logo, 'https://api-alpha.human-connection.org', ''),
o.coverImg              = replace(organization.coverImg, 'https://api-alpha.human-connection.org', ''),
o.deleted               = COALESCE(organization.deleted,false),
o.disabled              = NOT organization.isEnabled,
o.createdAt             = datetime(organization.createdAt.`$date`),
o.updatedAt             = datetime(organization.updatedAt.`$date`)
WITH o, organization
MATCH (u:User {id: organization.userId})
MERGE (u)-[:CREATED_ORGA]->(o)
MERGE (u)-[:OWNING_ORGA]->(o)
WITH o, organization
MATCH (u:User {id: organization.reviewedBy})
MERGE (u)-[:REVIEWED_ORGA]->(o)
WITH o, organization, organization.categoryIds as categoryIds
UNWIND categoryIds AS categoryId
MATCH (c:Category {id: categoryId})
MERGE (o)-[:CATEGORIZED]->(c)
WITH o, organization.tags AS tags
UNWIND tags AS tag
MERGE (t:Tag {id: tag, name: tag})
MERGE (o)-[:TAGGED]->(t)
;
