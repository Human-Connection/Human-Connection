<template>
  <base-card>
    <h2 class="title">{{ $t('settings.upload.name') }}</h2>
    <ds-input
      id="import"
      v-model="dataImport"
      type="textarea"
      rows="3"
      :placeholder="$t('settings.upload.placeholder')"
    />
    <base-button secondary filled icon="upload" @click="importData" :disabled="processing || dataImport === ''">
      {{ $t('settings.upload.submit') }}
    </base-button>
    <ds-space v-if="messagesPresent" margin="large" />
    <base-card v-if="messagesPresent">
      <ds-text v-for="message in messages" size="small" :key="message.key">
        {{ message.text }}
      </ds-text>
    </base-card>
  </base-card>
</template>

<script>
import PostMutations from '~/graphql/PostMutations.js'
import { isEmpty } from 'lodash'

export default {
  data() {
    return {
      dataImport: '',
      messages: [],
      processing: false,
      messageCounter: 0,
    }
  },
  computed: {
    messagesPresent() {
      return !isEmpty(this.messages)
    },
  },
  methods: {
    importData(data) {
      this.messages = []
      this.processing = true
      let input, userId, posts
      if (this.dataImport === '') {
        this.$toast.error(this.$t('settings.upload.isEmpty'))
        this.processing = false
        return
      }
      try {
        input = JSON.parse(this.dataImport)
      } catch (err) {
        this.$toast.error(err.message)
        this.processing = false
        return
      }
      this.messages.push({ text: 'input parsed successfully', key: this.messageCounter++ })
      try {
        userId = input.user.id
      } catch (err) {
        this.$toast.error(err.message)
        this.processing = false
        return
      }
      this.messages.push({ text: 'user ID is ' + userId, key: this.messageCounter++ })
      try {
        posts = input.posts.filter((post) => post.author.id === userId)
      } catch (err) {
        this.$toast.error(err.message)
        this.processing = false
        return
      }
      this.messages.push({
        text: String(posts.length) + ' posts found to import',
        key: this.messageCounter++,
      })
      posts.forEach(async (post) => {
        const { title, content, language } = post
        const categoryIds = post.categories.map((cat) => cat.id)
        this.$apollo
          .mutate({
            mutation: PostMutations().CreatePost,
            variables: {
              title,
              content,
              categoryIds,
              id: null,
              language,
            },
          })
          .then(({ data }) => {
            this.messages.push({ text: 'IMPORTING: ' + title, key: this.messageCounter++ })
          })
          .catch((err) => {
            this.$toast.error(err.message)
          })
      })
      this.processing = false
    },
  },
}
</script>
