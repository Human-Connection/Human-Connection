/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   name: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   slug: {
[ ]     type: String,
[ ]     required: true,
[ ]     unique: true,
[-]     index: true
      },
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
[ ]   categoryIds: {
[ ]     type: Array,
[ ]     required: true,
[-]     index: true
      },
[ ]   logo: { type: String },
[ ]   coverImg: { type: String },
[ ]   userId: {
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   description: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   descriptionExcerpt: { type: String }, // will be generated automatically
[ ]   publicEmail: { type: String },
[ ]   url: { type: String },
[ ]   type: {
[ ]     type: String,
[-]     index: true,
[ ]     enum: ['ngo', 'npo', 'goodpurpose', 'ev', 'eva']
      },
[ ]   language: {
[ ]     type: String,
[ ]     required: true,
[ ]     default: 'de',
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
[ ]   createdAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   updatedAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   isEnabled: {
[ ]     type: Boolean,
[ ]     default: false,
[-]     index: true
      },
[ ]   reviewedBy: {
[ ]     type: String,
[ ]     default: null,
[-]     index: true
      },
[ ]   tags: {
[ ]     type: Array,
[-]     index: true
      },
[ ]   deleted: {
[ ]     type: Boolean,
[ ]     default: false,
[-]     index: true
      },
[ ]   wasSeeded: { type: Boolean }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as organisation;
