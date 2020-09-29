<template>
  <base-card>
    <h2 class="title">{{ $t('settings.download.name') }}</h2>
    <button @click="onClick">Download data</button>
  </base-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { userDataQuery } from '~/graphql/User'

export default {
  data() {
    return {
      userData: {},
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    jsonData() {
      return JSON.stringify(this.userData)
    },
  },
  methods: {
    onClick() {
      var fileURL = window.URL.createObjectURL(new Blob([this.jsonData]))
      var fileLink = document.createElement('a')
      fileLink.href = fileURL
      fileLink.setAttribute('download', 'userData.json')
      document.body.appendChild(fileLink)
      fileLink.click()
    },
  },
  apollo: {
    queryUserData: {
      query() {
        return userDataQuery()
      },
      variables() {
        return { id: this.user.id }
      },
      update({ userData }) {
        this.userData = userData
      },
    },
  },
}
</script>
