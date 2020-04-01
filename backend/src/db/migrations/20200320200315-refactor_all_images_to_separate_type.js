/* eslint-disable no-console */
import { getDriver } from '../../db/neo4j'

export const description = `
  Refactor all our image properties on posts and users to a dedicated type
  "Image" which contains metadata and image file urls.
`

const printSummaries = (summaries) => {
  console.log('=========================================')
  summaries.forEach((stat) => {
    console.log(stat.query.text)
    console.log(JSON.stringify(stat.counters, null, 2))
  })
  console.log('=========================================')
}

export async function up() {
  const driver = getDriver()
  const session = driver.session()
  const writeTxResultPromise = session.writeTransaction(async (txc) => {
    const runs = await Promise.all(
      [
        `
      MATCH (post:Post)
      WHERE post.image IS NOT NULL AND post.deleted = FALSE
      MERGE(image:Image {url: post.image})
      CREATE (post)-[:HERO_IMAGE]->(image)
      SET
        image.sensitive   = post.imageBlurred,
        image.aspectRatio = post.imageAspectRatio
      REMOVE
        post.image,
        post.imageBlurred,
        post.imageAspectRatio
    `,
        `
      MATCH (user:User)
      WHERE user.avatar IS NOT NULL AND user.deleted = FALSE
      MERGE(avatar:Image {url: user.avatar})
      CREATE (user)-[:AVATAR_IMAGE]->(avatar)
      REMOVE user.avatar
    `,
        `
      MATCH (user:User)
      WHERE user.coverImg IS NOT NULL AND user.deleted = FALSE
      MERGE(coverImage:Image {url: user.coverImg})
      CREATE (user)-[:COVER_IMAGE]->(coverImage)
      REMOVE user.coverImg
    `,
      ].map((s) => txc.run(s)),
    )
    return runs.map(({ summary }) => summary)
  })

  try {
    const stats = await writeTxResultPromise
    console.log('Created image nodes from all user avatars and post images.')
    printSummaries(stats)
  } finally {
    session.close()
  }
}

export async function down() {
  const driver = getDriver()
  const session = driver.session()
  const writeTxResultPromise = session.writeTransaction(async (txc) => {
    const runs = await Promise.all(
      [
        `
      MATCH (post)-[:HERO_IMAGE]->(image:Image)
      SET
        post.image            = image.url,
        post.imageBlurred     = image.sensitive,
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
      ].map((s) => txc.run(s)),
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
