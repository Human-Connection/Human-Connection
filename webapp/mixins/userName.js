export default {
  methods: {
    userName(userName) {
      // Return Anonymous if no Username is given else return full Username
      return userName ? userName : this.$t('profile.userAnonym')
    }
  }
}
