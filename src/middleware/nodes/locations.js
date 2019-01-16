
import request from 'request'
import { UserInputError } from 'apollo-server'
import isEmpty from 'lodash/isEmpty'
import asyncForEach from '../../helpers/asyncForEach'

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

const locales = [
  'en',
  'de',
  'fr',
  'nl',
  'it',
  'es',
  'pt',
  'pl'
]

const createLocation = async (session, mapboxData) => {
  const data = {
    id: mapboxData.id,
    nameEN: mapboxData.text_en,
    nameDE: mapboxData.text_de,
    nameFR: mapboxData.text_fr,
    nameNL: mapboxData.text_nl,
    nameIT: mapboxData.text_it,
    nameES: mapboxData.text_es,
    namePT: mapboxData.text_pt,
    namePL: mapboxData.text_pl,
    type: mapboxData.id.split('.')[0].toLowerCase(),
    lat: (mapboxData.center && mapboxData.center.length) ? mapboxData.center[0] : null,
    lng: (mapboxData.center && mapboxData.center.length) ? mapboxData.center[1] : null
  }

  let query = 'MERGE (l:Location {id: $id}) ' +
              'SET l.name = $nameEN, ' +
                  'l.nameEN = $nameEN, ' +
                  'l.nameDE = $nameDE, ' +
                  'l.nameFR = $nameFR, ' +
                  'l.nameNL = $nameNL, ' +
                  'l.nameIT = $nameIT, ' +
                  'l.nameES = $nameES, ' +
                  'l.namePT = $namePT, ' +
                  'l.namePL = $namePL, ' +
                  'l.type = $type'

  if (data.lat && data.lng) {
    query += ', l.lat = $lat, l.lng = $lng'
  }
  query += ' RETURN l.id'

  await session.run(query, data)
}

const createOrUpdateLocations = async (userId, locationName, driver) => {
  if (isEmpty(locationName)) {
    return
  }
  const mapboxToken = process.env.MAPBOX_TOKEN
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${mapboxToken}&types=region,place,country&language=${locales.join(',')}`)

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

  if (!data || !data.place_type || !data.place_type.length) {
    throw new UserInputError('locationName is invalid')
  }

  const session = driver.session()
  await createLocation(session, data)

  let parent = data

  if (data.context) {
    await asyncForEach(data.context, async ctx => {
      await createLocation(session, ctx)

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

export default createOrUpdateLocations
