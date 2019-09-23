<template>
  <ds-card :header="$t('post.allowEmbeds.name')">
    <p>{{ $t('post.allowEmbeds.statustext') }}</p>
    <ds-container width="large">
      <h3 v-html="allowEmbeds_h3" />
      <div v-html="allowEmbeds_desc" />
    </ds-container>
    <div>
      <ds-space />
      <ds-space />
      <p>{{ $t('post.allowEmbeds.statuschange') }}</p>
      <ds-container width="large">
        <ds-flex>
          <ds-flex-item>
            <ds-button @click="toFalse" primary :disabled="disabled">
              {{ $t('post.allowEmbeds.button-tofalse') }}
            </ds-button>
          </ds-flex-item>
          <ds-flex-item>
            <ds-button @click="toTrue" danger :disabled="!disabled">
              {{ $t('post.allowEmbeds.button-totrue') }}
            </ds-button>
          </ds-flex-item>
        </ds-flex>
      </ds-container>
    </div>
    <ds-space />
    <ds-space />

    <div v-show="!disabled">
      <p>{{ $t('post.allowEmbeds.description') }}</p>
      <ds-container>
        <ds-placeholder>
          <ul>
            <li v-for="provider in providers" :key="provider.provider_name">
              {{ provider.provider_name }},
              <small>{{ provider.provider_url }}</small>
            </li>
          </ul>
        </ds-placeholder>
      </ds-container>
    </div>
  </ds-card>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      allowEmbeds_h3: this.$t('post.allowEmbeds.false'),
      allowEmbeds_desc: this.$t('post.allowEmbeds.third-party-false'),
      disabled: true,
      providers: [],
    }
  },
  mounted() {
    axios.get('../api/providers.json').then(response => {
      this.providers = response.data
    })
  },
  methods: {
    toFalse: function() {
      this.allowEmbeds_h3 = this.$t('post.allowEmbeds.false')
      this.allowEmbeds_desc = this.$t('post.allowEmbeds.third-party-false')
      this.disabled = true
    },
    toTrue: function() {
      this.allowEmbeds_h3 = this.$t('post.allowEmbeds.true')
      this.allowEmbeds_desc = this.$t('post.allowEmbeds.third-party-true')
      this.disabled = false
    },
  },
}
</script>
