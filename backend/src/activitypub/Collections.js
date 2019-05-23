export default class Collections {
  constructor(dataSource) {
    this.dataSource = dataSource
  }
  getFollowersCollection(actorId) {
    return this.dataSource.getFollowersCollection(actorId)
  }

  getFollowersCollectionPage(actorId) {
    return this.dataSource.getFollowersCollectionPage(actorId)
  }

  getFollowingCollection(actorId) {
    return this.dataSource.getFollowingCollection(actorId)
  }

  getFollowingCollectionPage(actorId) {
    return this.dataSource.getFollowingCollectionPage(actorId)
  }

  getOutboxCollection(actorId) {
    return this.dataSource.getOutboxCollection(actorId)
  }

  getOutboxCollectionPage(actorId) {
    return this.dataSource.getOutboxCollectionPage(actorId)
  }
}
