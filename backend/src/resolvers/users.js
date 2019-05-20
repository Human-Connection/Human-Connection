import { neo4jgraphql } from 'neo4j-graphql-js'
import { createWriteStream } from 'fs'


const storeUpload = ({ stream, fileLocation}) =>
  new Promise((resolve, reject) =>
    stream
    .pipe(createWriteStream(`public${fileLocation}`))
    .on("finish", () => resolve())
    .on("error", reject)
  );

export default {
  Mutation: {
    UpdateUser: async (object, params, context, resolveInfo) => {
      const { avatarUpload } = params

      if (avatarUpload) {
        const { stream, filename } = await avatarUpload ;
        const fileLocation = `/uploads/${filename}`
        await storeUpload({ stream, fileLocation });
        delete params.avatarUpload

        params.avatar = fileLocation
      }
      return await neo4jgraphql(object, params, context, resolveInfo, false)
    }
  },
};
