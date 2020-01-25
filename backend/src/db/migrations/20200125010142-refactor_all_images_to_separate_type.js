/* eslint-disable no-console */
import { getDriver } from '../../db/neo4j'

export const description = `
  Refactor all our image properties on posts and users to a dedicated type
  "Image" which contains metadata and image file urls.
`

const printSummaries = summaries => {
  console.log('=========================================')
  summaries.forEach(stat => {
    console.log(stat.query.text)
    console.log(JSON.stringify(stat.counters, null, 2))
  })
  console.log('=========================================')
}

export async function up() {
  const driver = getDriver()
  const session = driver.session()
  const writeTxResultPromise = session.writeTransaction(async txc => {
    const runs = await Promise.all(
      [
        `
      MATCH (post:Post)
      WHERE post.image IS NOT NULL
      CREATE (post)-[:TEASER_IMAGE]->(image:Image)
      SET
        image.url         = post.image,
        image.blurred     = post.imageBlurred,
        image.aspectRatio = post.imageAspectRatio
      REMOVE
        post.image,
        post.imageBlurred,
        post.imageAspectRatio
    `,
        `
      MATCH (user:User)
      WHERE user.avatar IS NOT NULL
      CREATE (user)-[:AVATAR_IMAGE]->(avatar:Image)
      SET avatar.url = user.avatar
      REMOVE user.avatar
    `,
        `
      MATCH (user:User)
      WHERE user.coverImg IS NOT NULL
      CREATE (user)-[:COVER_IMAGE]->(coverImage:Image)
      SET coverImage.url = user.coverImg
      REMOVE user.coverImg
    `,
      ].map(s => txc.run(s)),
    )
    return runs.map(({ summary }) => summary)
  })

  try {
    const stats = await writeTxResultPromise
    console.log('Splitted all images from users and posts.')
    printSummaries(stats)
  } finally {
    session.close()
  }
}

export async function down() {
  const driver = getDriver()
  const session = driver.session()
  const writeTxResultPromise = session.writeTransaction(async txc => {
    const runs = await Promise.all(
      [
        `
      MATCH (post)-[:TEASER_IMAGE]->(image:Image)
      SET
        post.image            = image.url,
        post.imageBlurred     = image.blurred,
        post.imageAspectRatio = image.aspectRatio
      DETACH DELETE image
    `,
        `
      MATCH(user)-[:AVATAR_IMAGE]->(avatar:Image)
      SET user.avatar = avatar.url
      DETACH DELETE avatar
    `,
        `
      MATCH(user)-[:COVER_IMAGE]->(coverImage:Image)
      SET user.coverImg = coverImage.url
      DETACH DELETE coverImage
    `,
      ].map(s => txc.run(s)),
    )
    return runs.map(({ summary }) => summary)
  })

  try {
    const stats = await writeTxResultPromise
    console.log('UNDO: Split images from users and posts.')
    printSummaries(stats)
  } finally {
    session.close()
  }
}
