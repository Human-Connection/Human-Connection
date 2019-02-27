<template>
  <ds-form
    v-model="form"
    @submit="submit"
  >
    <ds-card :header="$t('settings.data.name')">
      <ds-input
        id="name"
        model="name"
        icon="user"
        :label="$t('settings.data.labelName')"
        :placeholder="$t('settings.data.labelName')"
      />
      <!-- eslint-disable vue/use-v-on-exact -->
      <ds-select
        id="city"
        model="locationName"
        icon="map-marker"
        :options="cities"
        :label="$t('settings.data.labelCity')"
        :placeholder="$t('settings.data.labelCity')"
        @input.native="handleCityInput"
      />
      <!-- eslint-enable vue/use-v-on-exact -->
      <ds-input
        id="bio"
        model="about"
        type="textarea"
        rows="3"
        :label="$t('settings.data.labelBio')"
        :placeholder="$t('settings.data.labelBio')"
      />
      <template slot="footer">
        <ds-button
          style="float: right;"
          icon="check"
          type="submit"
          :loading="sending"
          primary
        >
          {{ $t('actions.save') }}
        </ds-button>
      </template>
    </ds-card>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'

import { mapGetters, mapMutations } from 'vuex'
import { CancelToken } from 'axios'
import find from 'lodash/find'

let timeout
const mapboxToken = process.env.MAPBOX_TOKEN

const query = gql`
  query getUser($id: ID) {
    User(id: $id) {
      id
      name
      locationName
      about
    }
  }
`

const mutation = gql`
  mutation($id: ID!, $name: String, $locationName: String, $about: String) {
    UpdateUser(
      id: $id
      name: $name
      locationName: $locationName
      about: $about
    ) {
      id
      name
      locationName
      about
    }
  }
`

export default {
  data() {
    return {
      axiosSource: null,
      cities: [],
      sending: false,
      users: [],
      form: {
        name: null,
        locationName: null,
        about: null
      }
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    }),
    ...mapMutations({
      currentUser: 'auth/user'
    })
  },
  watch: {
    users: function(users) {
      const { name, locationName, about } = users[0]
      this.form = { name, locationName, about }
    }
  },
  apollo: {
    users: function() {
      return {
        query,
        variables: {
          id: this.currentUser.id
        },
        update: data => data.User
      }
    }
  },
  methods: {
    submit() {
      this.sending = true
      this.$apollo
        .mutate({
          mutation,
          variables: {
            id: this.currentUser.id,
            name: this.form.name,
            locationName: this.form.locationName
              ? this.form.locationName['label'] || this.form.locationName
              : null,
            about: this.form.about
          },
          update: (store, { data: { UpdateUser } }) => {
            const { name, locationName, about } = UpdateUser
            this.form = { name, locationName, about }
            this.currentUser = {
              ...this.currentUser,
              name,
              locationName,
              about
            }
          }
        })
        .then(data => {
          this.$toast.success('Updated user')
        })
        .catch(err => {
          this.$toast.error(err.message)
        })
        .finally(() => {
          this.sending = false
        })
    },
    handleCityInput(value) {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.requestGeoData(value), 500)
    },
    processCityResults(res) {
      if (
        !res ||
        !res.data ||
        !res.data.features ||
        !res.data.features.length
      ) {
        return []
      }
      let output = []
      res.data.features.forEach(item => {
        output.push({
          label: item.place_name,
          value: item.place_name,
          id: item.id
        })
      })

      return output
    },
    requestGeoData(e) {
      if (this.axiosSource) {
        // cancel last request
        this.axiosSource.cancel()
      }

      const value = e.target ? e.target.value.trim() : ''
      if (value === '' || value.length < 3) {
        this.cities = []
        return
      }

      this.axiosSource = CancelToken.source()

      const place = encodeURIComponent(value)
      const lang = this.$i18n.locale()

      this.$axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${mapboxToken}&types=region,place,country&language=${lang}`,
          {
            cancelToken: this.axiosSource.token
          }
        )
        .then(res => {
          this.cities = this.processCityResults(res)
        })
    }
  }
}
</script>
