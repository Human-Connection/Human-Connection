<template>
  <base-card>
    <h2 class="title">{{ $t('settings.download.name') }}</h2>
    <base-button
      @click="onClick(jsonData)"
      icon="download"
      secondary
      filled
      :disabled="loading"
      :loading="loading"
    >
      {{ $t('settings.download.json') }}
    </base-button>
    <ds-space margin="large" />
    <ds-text>{{ $t('settings.download.description') }}</ds-text>
    <ds-space margin="large" />
    <base-card v-for="image in imageList" :key="image.key">
      <a :href="image.url" target="_blank" rel="noopener noreferrer">{{ image.title }}</a>
      <ds-space margin="xxx-small" />
    </base-card>
  </base-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { userDataQuery } from '~/graphql/User'
import BaseButton from '~/components/_new/generic/BaseButton/BaseButton.vue'
import isEmpty from 'lodash/isEmpty'

export default {
  components: {
    BaseButton,
  },
  data() {
    return {
      userData: {},
      loading: true,
      imageList: [],
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    jsonData() {
      return { data: JSON.stringify(this.userData, null, 2), type: 'json' }
    },
  },
  methods: {
    onClick(method) {
      var fileURL = window.URL.createObjectURL(new Blob([method.data]))
      var fileLink = document.createElement('a')
      fileLink.href = fileURL
      fileLink.setAttribute('download', 'userData.' + method.type)
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
        this.loading = false
        if (isEmpty(this.userData)) return null
        const userId = this.userData.user.id
        if (isEmpty(userId)) return null
        this.imageList = this.userData.posts
          .filter((post) => post.author.id === userId && post.image)
          .map((post) => {
            const obj = {}
            obj.key = post.id
            obj.url = post.image.url
            obj.title = post.title
            return obj
          })
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
