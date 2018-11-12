import request from 'request'
import zipObject from 'lodash/zipObject'

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

const createOrUpdateLocations = async (userId, locationId, driver) =>{
  if (!locationId) {
    return
  }
  console.log('userId', userId)
  console.log('locationId', locationId)

  const mapboxToken = 'pk.eyJ1IjoiaHVtYW4tY29ubmVjdGlvbiIsImEiOiJjajl0cnBubGoweTVlM3VwZ2lzNTNud3ZtIn0.KZ8KK9l70omjXbEkkbHGsQ'
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationId}.json?access_token=${mapboxToken}&language=de`)

  // TODO: create location in db

  // TODO: get related region, district and country to build the location tree

  const data = res.features[0]
  const session = driver.session()
  const r = await session.run(`MERGE (l:Location {id: "${data.id}"}) SET l.name = "${data.place_name}", l.type = "${data.place_type[0]}", l.lat = "${data.center[0]}", l.lng = "${data.center[1]}" RETURN l.id, l.name, l.type, l.lat, l.lng`)
  // let location = r.records[0]._fields ? zipObject([
  //   'id',
  //   'name',
  //   'type',
  //   'lat',
  //   'lng'
  // ], r.records[0]._fields) : null

  // delete all current locations from user
  await session.run(`MATCH (u:User {id: "${userId}"})-[r:IS_IN]->(l:Location) DETACH DELETE r`)
  // connect user with location
  await session.run(`MATCH (u:User {id: "${userId}"}), (l:Location {id: "${data.id}"}) MERGE (u)-[:IS_IN]->(l) RETURN l.id, u.id`)
  session.close()
}

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(context.user.id, args.locationId, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(context.user.id, args.locationId, context.driver)
      return result
    }
  }
}
