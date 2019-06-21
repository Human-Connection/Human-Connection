/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[?]   email: {
[X]     type: String,
[-]     index: true,
[X]     required: true,
[?]     unique: true //unique constrain missing in Nitro
      },
[?]   password: { // Not required in Alpha -> verify if always present
[X]     type: String
      },
[X]   name: { type: String },
[X]   slug: {
[X]     type: String,
[-]     index: true
      },
[ ]   gender: { type: String },
[ ]   followersCounts: {
[ ]     users: {
[ ]       type: Number,
[ ]       default: 0
        },
[ ]     organizations: {
[ ]       type: Number,
[ ]       default: 0
        },
[ ]     projects: { 
[ ]       type: Number,
[ ]       default: 0
        }
      },
[ ]   followingCounts: {
[ ]     users: {
[ ]       type: Number,
[ ]       default: 0
        },
[ ]     organizations: {
[ ]       type: Number,
[ ]       default: 0
        },
[ ]     projects: {
[ ]       type: Number,
[ ]       default: 0
        }
      },
[ ]   timezone: { type: String },
[X]   avatar: { type: String },
[X]   coverImg: { type: String },
[ ]   doiToken: { type: String },
[ ]   confirmedAt: { type: Date },
[?]   badgeIds: [], // Verify this is working properly
[?]   deletedAt: { type: Date }, // The Date of deletion is not saved in Nitro
[?]   createdAt: {
[?]     type: Date, // Modeled as String in Nitro
[ ]     default: Date.now // Default value is missing in Nitro
      },
[?]   updatedAt: {
[?]     type: Date, // Modeled as String in Nitro
[ ]     default: Date.now // Default value is missing in Nitro
      },
[ ]   lastActiveAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   isVerified: { type: Boolean },
[?]   role: {
[X]     type: String,
[-]     index: true,
[?]     enum: ['admin', 'moderator', 'manager', 'editor', 'user'], // missing roles manager & editor in Nitro
[ ]     default: 'user' // Default value is missing in Nitro
      },
[ ]   verifyToken: { type: String },
[ ]   verifyShortToken: { type: String },
[ ]   verifyExpires: { type: Date },
[ ]   verifyChanges: { type: Object },
[ ]   resetToken: { type: String },
[ ]   resetShortToken: { type: String },
[ ]   resetExpires: { type: Date },
[X]   wasSeeded: { type: Boolean },
[X]   wasInvited: { type: Boolean },
[ ]   language: {
[ ]     type: String,
[ ]     default: 'en'
      },
[ ]   termsAndConditionsAccepted: { type: Date }, // we display the terms and conditions on registration
[ ]   systemNotificationsSeen: {
[ ]     type: Array,
[ ]     default: []
      }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as user
MERGE(u:User {id: user._id["$oid"]})
ON CREATE SET
u.name       = user.name,
u.slug       = user.slug,
u.email      = user.email,
u.password   = user.password,
u.avatar     = replace(user.avatar, 'https://api-alpha.human-connection.org', ''),
u.coverImg   = replace(user.coverImg, 'https://api-alpha.human-connection.org', ''),
u.wasInvited = user.wasInvited,
u.wasSeeded  = user.wasSeeded,
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
