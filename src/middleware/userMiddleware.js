import request from 'request'
import { UserInputError } from 'apollo-server'
import isEmpty from 'lodash/isEmpty'

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

const createOrUpdateLocations = async (userId, locationName, driver) => {
  if (isEmpty(locationName)) {
    return
  }
  const mapboxToken = process.env.MAPBOX_TOKEN
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${mapboxToken}&types=region,place,country&language=en,de,fr,nl,it,es,pt,pl`)

  if (!res || !res.features || !res.features[0]) {
    throw new UserInputError('locationName is invalid')
  }

  let data

  res.features.forEach(item => {
    if (item.matching_place_name === locationName) {
      data = item
    }
  })
  if (!data) {
    data = res.features[0]
  }

  if (!data) {
    throw new UserInputError('locationName is invalid')
  }

  const session = driver.session()
  await session.run(
    'MERGE (l:Location {id: $id}) ' +
    'SET l.name = $nameEN, ' +
        'l.nameEN = $nameEN, ' +
        'l.nameDE = $nameDE, ' +
        'l.nameFR = $nameFR, ' +
        'l.nameNL = $nameNL, ' +
        'l.nameIT = $nameIT, ' +
        'l.nameES = $nameES, ' +
        'l.namePT = $namePT, ' +
        'l.namePL = $namePL, ' +
        'l.type = $type, ' +
        'l.lat = $lat, ' +
        'l.lng = $lng ' +
    'RETURN l.id', {
      id: data.id,
      nameEN: data.text_en,
      nameDE: data.text_de,
      nameFR: data.text_fr,
      nameNL: data.text_nl,
      nameIT: data.text_it,
      nameES: data.text_es,
      namePT: data.text_pt,
      namePL: data.text_pl,
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
        'SET l.name = $nameEN, ' +
            'l.nameEN = $nameEN, ' +
            'l.nameDE = $nameDE, ' +
            'l.nameFR = $nameFR, ' +
            'l.nameNL = $nameNL, ' +
            'l.nameIT = $nameIT, ' +
            'l.nameES = $nameES, ' +
            'l.namePT = $namePT, ' +
            'l.namePL = $namePL, ' +
            'l.type = $type, ' +
            'l.shortCode = $shortCode ' +
        'RETURN l.id', {
          id: ctx.id,
          nameEN: ctx.text_en,
          nameDE: ctx.text_de,
          nameFR: ctx.text_fr,
          nameNL: ctx.text_nl,
          nameIT: ctx.text_it,
          nameES: ctx.text_es,
          namePT: ctx.text_pt,
          namePL: ctx.text_pl,
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
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    }
  }
}
