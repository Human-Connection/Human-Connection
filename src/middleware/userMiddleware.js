import request from 'request'


const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const fetch = url => {
  return new Promise((resolve, reject) => {
    request(url, function (error, response, body) {
      if (error) {
        reject(error)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

const createOrUpdateLocations = async (userId, locationName, driver) =>{
  if (!locationName) {
    return
  }
  const mapboxToken = process.env.MAPBOX_TOKEN
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationName}.json?access_token=${mapboxToken}&language=de`)

  // TODO: create location in db

  // TODO: get related region, district and country to build the location tree

  const data = res.features[0]
  const session = driver.session()
  await session.run(
    'MERGE (l:Location {id: $id}) ' +
    'SET l.name = $name, ' +
        'l.type = $type, ' +
        'l.lat = $lat, ' +
        'l.lng = $lng ' +
    'RETURN l.id, l.name, l.type, l.lat, l.lng', {
      id: data.id,
      name: data.text,
      type: data.place_type[0].toLowerCase(),
      lat: data.center[0],
      lng: data.center[1]
    }
  )

  let parent = data

  if (data.context) {
    await asyncForEach(data.context, async ctx => {
      const type = ctx.id.split('.')[0].toLowerCase()
      await session.run(
        'MERGE (l:Location {id: $id}) ' +
        'SET l.name = $name, ' +
            'l.type = $type, ' +
            'l.shortCode = $short_code ' +
        'RETURN l.id, l.name, l.type', {
          id: ctx.id,
          name: ctx.text,
          type: type,
          shortCode: ctx.short_code
        }
      )
      await session.run(
        'MATCH (parent:Location {id: $parentId}), (child:Location {id: $childId}) ' +
        'MERGE (child)<-[:IS_IN]-(parent) ' +
        'RETURN child.id, parent.id', {
          parentId: parent.id,
          childId: ctx.id
        })

      parent = ctx
    })
  }
  // delete all current locations from user
  await session.run('MATCH (u:User {id: $userId})-[r:IS_IN]->(l:Location) DETACH DELETE r', {
    userId: userId
  })
  // connect user with location
  await session.run('MATCH (u:User {id: $userId}), (l:Location {id: $locationId}) MERGE (u)-[:IS_IN]->(l) RETURN l.id, u.id', {
    userId: userId,
    locationId: data.id
  })
  session.close()
}

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(context.user.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(context.user.id, args.locationName, context.driver)
      return result
    }
  }
}
