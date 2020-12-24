import request from 'request'
import { UserInputError } from 'apollo-server'
import isEmpty from 'lodash/isEmpty'
import Debug from 'debug'
import asyncForEach from '../../../helpers/asyncForEach'
import CONFIG from '../../../config'

const debug = Debug('human-connection:location')

const fetch = (url) => {
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

const locales = ['en', 'de', 'fr', 'nl', 'it', 'es', 'pt', 'pl', 'ru']

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
    nameRU: mapboxData.text_ru,
    type: mapboxData.id.split('.')[0].toLowerCase(),
    lng: mapboxData.center && mapboxData.center.length ? mapboxData.center[0] : null,
    lat: mapboxData.center && mapboxData.center.length ? mapboxData.center[1] : null,
  }

  let mutation =
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
    'l.nameRU = $nameRU, ' +
    'l.type = $type'

  if (data.lat && data.lng) {
    mutation += ', l.lat = $lat, l.lng = $lng'
  }
  mutation += ' RETURN l.id'

  await session.writeTransaction((transaction) => {
    return transaction.run(mutation, data)
  })
}

const createOrUpdateLocations = async (resourceId, locationName, session) => {
  if (isEmpty(locationName)) {
    return
  }
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      locationName,
    )}.json?access_token=${CONFIG.MAPBOX_TOKEN}&types=region,place,country&language=${locales.join(
      ',',
    )}`,
  )

  debug(res)

  if (!res || !res.features || !res.features[0]) {
    throw new UserInputError('locationName is invalid')
  }

  let data

  res.features.forEach((item) => {
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

  if (data.place_type.length > 1) {
    data.id = 'region.' + data.id.split('.')[1]
  }
  await createLocation(session, data)

  let parent = data

  if (data.context) {
    await asyncForEach(data.context, async (ctx) => {
      await createLocation(session, ctx)
      await session.writeTransaction((transaction) => {
        return transaction.run(
          `
              MATCH (parent:Location {id: $parentId}), (child:Location {id: $childId})
              MERGE (child)<-[:IS_IN]-(parent)
              RETURN child.id, parent.id
            `,
          {
            parentId: parent.id,
            childId: ctx.id,
          },
        )
      })
      parent = ctx
    })
  }
  // delete all current locations from resource
  //  and add new location
  await session.writeTransaction((transaction) => {
    return transaction.run(
      `
          MATCH (resource {id: $resourceId})
          OPTIONAL MATCH (resource)-[relationship:IS_IN]->(location:Location)
          DELETE relationship
          WITH resource
          MATCH (location:Location {id: $locationId})
          MERGE (resource)-[:IS_IN]->(location)
          RETURN location.id, resource.id
        `,
      { resourceId, locationId: data.id },
    )
  })
}

export default createOrUpdateLocations
