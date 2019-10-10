<template>
  <ds-card :header="$t('settings.embeds.name')">
    <ds-section>
      <ds-text>
        {{ $t('settings.embeds.status.description') }}
        <ds-text bold>
          {{ $t(`settings.embeds.status.disabled.${disabled}`) }}
        </ds-text>
        .
      </ds-text>
      <ds-text>
        {{ $t('settings.embeds.status.change.question') }}
      </ds-text>
      <ds-button @click="toFalse" :primary="!disabled" :disabled="!disabled">
        {{ $t('settings.embeds.status.change.deny') }}
      </ds-button>
      <ds-button @click="toTrue" :primary="disabled" :disabled="disabled">
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
      allowEmbeds_h3: this.$t('settings.embeds.false'),
      allowEmbeds_desc: this.$t('settings.embeds.third-party-false'),
      disabled: null,
      providers: [],
    }
  },
  mounted() {
    axios.get('../api/providers.json').then(response => {
      this.providers = response.data
    })
    this.disabled = this.currentUser.allowEmbedIframes
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    toFalse() {
      this.allowEmbeds_h3 = this.$t('settings.embeds.false')
      this.allowEmbeds_desc = this.$t('settings.embeds.third-party-false')
      this.submit()
    },
    toTrue() {
      this.allowEmbeds_h3 = this.$t('settings.embeds.true')
      this.allowEmbeds_desc = this.$t('settings.embeds.third-party-true')
      this.submit()
    },
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
