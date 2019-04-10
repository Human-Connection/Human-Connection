import {
  extractNameFromId,
  extractHostFromUrl,
  signAndSend
} from './utils'
import {
  isPublicAddressed,
  sendAcceptActivity,
  sendRejectActivity
} from './utils/activity'
import request from 'request'
import as from 'activitystrea.ms'
import NitroDataSource from './NitroDataSource'
import router from './routes'
import Collections from './Collections'
import uuid from 'uuid/v4'
import express from 'express'
import dotenv from 'dotenv'
const debug = require('debug')('ea')

let activityPub = null

export { activityPub }

export default function (server) {
  if (!activityPub) {
    activityPub = new ActivityPub()

    // integrate into running express server
    if (server) {
      server.express.set('ap', activityPub)
      server.express.use(router)
      console.log('-> ActivityPub middleware added to the express server')
      return
    }

    // start standalone express server
    dotenv.config()

    const app = express()
    app.set('ap', activityPub)
    app.use(router)
    app.listen(process.env.ACTIVITYPUB_PORT || 4010, () => {
      console.log(`ActivityPub express service listening on port ${process.env.ACTIVITYPUB_PORT || 4010}`)
    })
  } else {
    console.log('-> ActivityPub middleware already added to the express server')
  }
}

function ActivityPub () {
  this.endpoint = process.env.CLIENT_URI || 'http://localhost:3000'
  this.dataSource = new NitroDataSource(process.env.GRAPHQL_URI || 'http://localhost:4000')
  this.collections = new Collections(this.dataSource)

  this.handleFollowActivity = (activity) => {
    debug(`inside FOLLOW ${activity.actor}`)
    let toActorName = extractNameFromId(activity.object)
    let fromDomain = extractHostFromUrl(activity.actor)
    const dataSource = this.dataSource

    return new Promise((resolve, reject) => {
      request({
        url: activity.actor,
        headers: {
          'Accept': 'application/activity+json'
        }
      }, async (err, response, toActorObject) => {
        if (err) return reject(err)
        // save shared inbox
        toActorObject = JSON.parse(toActorObject)
        await this.dataSource.addSharedInboxEndpoint(toActorObject.endpoints.sharedInbox)

        let followersCollectionPage = await this.dataSource.getFollowersCollectionPage(activity.object)

        const followActivity = as.follow()
          .id(activity.id)
          .actor(activity.actor)
          .object(activity.object)

        // add follower if not already in collection
        if (followersCollectionPage.orderedItems.includes(activity.actor)) {
          debug('follower already in collection!')
          debug(`inbox = ${toActorObject.inbox}`)
          resolve(sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        } else {
          followersCollectionPage.orderedItems.push(activity.actor)
        }
        debug(`toActorObject = ${toActorObject}`)
        toActorObject = typeof toActorObject !== 'object' ? JSON.parse(toActorObject) : toActorObject
        debug(`followers = ${JSON.stringify(followersCollectionPage.orderedItems, null, 2)}`)
        debug(`inbox = ${toActorObject.inbox}`)
        debug(`outbox = ${toActorObject.outbox}`)
        debug(`followers = ${toActorObject.followers}`)
        debug(`following = ${toActorObject.following}`)

        try {
          await dataSource.saveFollowersCollectionPage(followersCollectionPage)
          debug('follow activity saved')
          resolve(sendAcceptActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        } catch (e) {
          debug('followers update error!', e)
          resolve(sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        }
      })
    })
  }

  this.handleUndoActivity = (activity) => {
    debug('inside UNDO')
    switch (activity.object.type) {
    case 'Follow':
      const followActivity = activity.object
      return this.dataSource.undoFollowActivity(followActivity.actor, followActivity.object)
    case 'Like':
      return this.dataSource.deleteShouted(activity)
    default:
    }
  }

  this.handleCreateActivity = (activity) => {
    debug('inside create')
    switch (activity.object.type) {
    case 'Article':
    case 'Note':
      const articleObject = activity.object
      if (articleObject.inReplyTo) {
        return this.dataSource.createComment(activity)
      } else {
        return this.dataSource.createPost(activity)
      }
    default:
    }
  }

  this.handleDeleteActivity = (activity) => {
    debug('inside delete')
    switch (activity.object.type) {
    case 'Article':
    case 'Note':
      return this.dataSource.deletePost(activity)
    default:
    }
  }

  this.handleUpdateActivity = (activity) => {
    debug('inside update')
    switch (activity.object.type) {
    case 'Note':
    case 'Article':
      return this.dataSource.updatePost(activity)
    default:
    }
  }

  this.handleLikeActivity = (activity) => {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.createShouted(activity)
  }

  this.handleDislikeActivity = (activity) => {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.deleteShouted(activity)
  }

  this.handleAcceptActivity = async (activity) => {
    switch (activity.object.type) {
    case 'Follow':
      const followObject = activity.object
      const followingCollectionPage = await this.collections.getFollowingCollectionPage(followObject.actor)
      followingCollectionPage.orderedItems.push(followObject.object)
      await this.dataSource.saveFollowingCollectionPage(followingCollectionPage)
    }
  }

  this.getActorObject = (url) => {
    return new Promise((resolve, reject) => {
      request({
        url: url,
        headers: {
          'Accept': 'application/json'
        }
      }, (err, response, body) => {
        if (err) {
          reject(err)
        }
        resolve(JSON.parse(body))
      })
    })
  }

  this.getActorId = async (name) => {
    return await this.dataSource.getActorId(name)
  }

  this.generateStatusId = (slug) => {
    return `${this.endpoint}/api/users/${slug}/status/${uuid()}`
  }

  this.sendActivity = async (activity) => {
    delete activity.send
    const fromName = extractNameFromId(activity.actor)

    if (Array.isArray(activity.to) && isPublicAddressed(activity)) {
      debug('is public addressed')
      const sharedInboxEndpoints = await this.dataSource.getSharedInboxEndpoints()
      // serve shared inbox endpoints
      sharedInboxEndpoints.forEach((sharedInbox) => {
        return trySend(activity, fromName, new URL(sharedInbox).host, sharedInbox)
      })
      activity.to = activity.to.filter((recipient) => {
        return !(isPublicAddressed({ to: recipient }))
      })
      // serve the rest
      activity.to.forEach(async (recipient) => {
        debug('serve rest')
        const actorObject = await this.getActorObject(recipient)
        return trySend(activity, fromName, new URL(recipient).host, actorObject.inbox)
      })

    } else if (typeof activity.to === 'string') {
      debug('is string')
      const actorObject = await this.getActorObject(activity.to)
      return trySend(activity, fromName, new URL(activity.to).host, actorObject.inbox)

    } else if (Array.isArray(activity.to)) {
      activity.to.forEach(async (recipient) => {
        const actorObject = await this.getActorObject(recipient)
        return trySend(activity, fromName, new URL(recipient).host, actorObject.inbox)
      })
    }
  }

  async function trySend (activity, fromName, toHost, url, tries = 3) {
    if (tries === 0) {
      return
    }

    try {
      return await signAndSend(activity, fromName, toHost, url)
    } catch (e) {
      setTimeout(function () {
        return trySend(activity, fromName, toHost, url, --tries)
      }, 20000)
    }
  }

  return this
}
