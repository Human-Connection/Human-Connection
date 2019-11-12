<template>
  <ds-card :header="$t('settings.privacy.name')">
    <ds-space margin-bottom="small">
      <input id="allow-shouts" type="checkbox" v-model="shoutsAllowed" />
      <label for="allow-shouts">{{ $t('settings.privacy.make-shouts-public') }}</label>
    </ds-space>
    <ds-button primary @click="submit">{{ $t('actions.save') }}</ds-button>
  </ds-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    shoutsAllowed: {
      get() {
        return this.currentUser.shoutsAllowed || false
      },
      set(value) {
        return value
      },
    },
  },
  methods: {
    submit() {
      console.log('wohoo')
    },
  },
}
</script>
