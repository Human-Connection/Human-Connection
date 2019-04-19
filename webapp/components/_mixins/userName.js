export default {
  methods: {
    userName(userName, maxLength) {
      // Return Anonymous if no Username is given
      if (!userName) {
        return this.$t('profile.userAnonym')
      }
      // Return full Username or truncated Username
      return maxLength ? userName.substring(0, maxLength) : userName
    }
  }
}
