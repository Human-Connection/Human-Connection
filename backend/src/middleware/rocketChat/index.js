import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'

const url = 'mongodb://localhost:27017';
const dbName = 'rocketchat';

export default {
  Mutation: {
    login: async (resolve, root, args, context, info) => {
      const token = await resolve(root, args, context, info)
      const {id, slug, name, avatar, email, role, disabled, actorId} = await jwt.verify(token, process.env.JWT_SECRET)
      MongoClient.connect(url, { useNewUrlParser: true }, async function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('users')
        const updateToken = await collection.updateOne({_id: id}, { $set: { 'services.iframe.token': token  }})
        if (updateToken || updateToken.nModified <= 0) {
          const user = {
            _id: id,
            createdAt: new Date(),
            services: { iframe: { token } },
            emails: [ { address: email, verified: true } ],
            name,
            username: slug,
            active: true,
            statusDefault: "online",
            roles: [ role ],
            type: "user"
          }
          collection.insertOne(user)
        }
        client.close();
      });
      return token
    }
  }
}
