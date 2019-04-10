export default Collections

function Collections(dataSource) {
  this.dataSource = dataSource

  this.getFollowersCollection = (actorId) => {
    return this.dataSource.getFollowersCollection(actorId)
  }

  this.getFollowersCollectionPage = (actorId) => {
    return this.dataSource.getFollowersCollectionPage(actorId)
  }

  this.getFollowingCollection = (actorId) => {
    return this.dataSource.getFollowingCollection(actorId)
  }

  this.getFollowingCollectionPage = (actorId) => {
    return this.dataSource.getFollowingCollectionPage(actorId)
  }

  this.getOutboxCollection = (actorId) => {
    return this.dataSource.getOutboxCollection(actorId)
  }

  this.getOutboxCollectionPage = (actorId) => {
    return this.dataSource.getOutboxCollectionPage(actorId)
  }
}

