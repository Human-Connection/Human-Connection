<template>
  <base-card>
    <h2 class="title">{{ $t('settings.download.name') }}</h2>
    <base-button @click="onClick(jsonData)" icon="download" secondary filled>
      {{ $t('settings.download.json') }}
    </base-button>
    <base-button @click="onClick(xmlData)" icon="download" secondary filled>
      {{ $t('settings.download.xml') }}
    </base-button>
  </base-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { userDataQuery } from '~/graphql/User'
import BaseButton from '~/components/_new/generic/BaseButton/BaseButton.vue'
import { json2xml } from 'xml-js'

export default {
  components: {
    BaseButton,
  },
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
      return { data: JSON.stringify(this.userData, null, 2), type: 'json' }
    },
    xmlData() {
      return {
        data: json2xml(
          { userData: this.userData },
          { compact: true, ignoreComment: true, spaces: 2 },
        ),
        type: 'xml',
      }
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
      },
    },
  },
}
</script>
