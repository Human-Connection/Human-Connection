<template>
  <ds-card :header="$t('settings.embeds.name')">
    <ds-section>
      <ds-text>
        {{ $t('settings.embeds.status.description') }}
        <ds-text bold>
          <template v-if="disabled">
            {{ $t(`settings.embeds.status.disabled.on`) }}
          </template>
          <template v-else>
            {{ $t(`settings.embeds.status.disabled.off`) }}
          </template>
        </ds-text>
        .
      </ds-text>
      <ds-text>
        {{ $t('settings.embeds.status.change.question') }}
      </ds-text>
      <ds-button @click="submit" :primary="!disabled" :disabled="!disabled">
        {{ $t('settings.embeds.status.change.deny') }}
      </ds-button>
      <ds-button @click="submit" :primary="disabled" :disabled="disabled">
        {{ $t('settings.embeds.status.change.allow') }}
      </ds-button>

      <p>{{ $t('settings.embeds.info-description') }}</p>
      <ul>
        <li v-for="provider in providers" :key="provider.provider_name">
          {{ provider.provider_name }},
          <small>{{ provider.provider_url }}</small>
        </li>
      </ul>
    </ds-section>
  </ds-card>
</template>

<script>
import axios from 'axios'
import { mapGetters, mapMutations } from 'vuex'
import { allowEmbedIframesMutation } from '~/graphql/User.js'

export default {
  head() {
    return {
      title: this.$t('settings.embeds.name'),
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  data() {
    return {
      disabled: null,
      providers: [],
    }
  },
  mounted() {
    axios.get('/api/providers.json').then(response => {
      this.providers = response.data
    })
    if (this.currentUser.allowEmbedIframes) this.disabled = this.currentUser.allowEmbedIframes
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async submit() {
      try {
        await this.$apollo.mutate({
          mutation: allowEmbedIframesMutation(),
          variables: {
            id: this.currentUser.id,
            allowEmbedIframes: !this.disabled,
          },
          update: (store, { data: { UpdateUser } }) => {
            const { allowEmbedIframes } = UpdateUser
            this.setCurrentUser({
              ...this.currentUser,
              allowEmbedIframes,
            })
          },
        })
        this.disabled = !this.disabled
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
