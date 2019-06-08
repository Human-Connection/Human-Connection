<template>
  <ds-form v-model="form" @submit="submit">
    <ds-card :header="$t('settings.data.name')">
      <ds-input
        id="name"
        model="name"
        icon="user"
        :label="$t('settings.data.labelName')"
        :placeholder="$t('settings.data.namePlaceholder')"
      />
      <!-- eslint-disable vue/use-v-on-exact -->
      <ds-select
        id="city"
        model="locationName"
        icon="map-marker"
        :options="cities"
        :label="$t('settings.data.labelCity')"
        :placeholder="$t('settings.data.labelCity')"
        :loading="loadingGeo"
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
        <ds-button style="float: right;" icon="check" type="submit" :loading="loadingData" primary>
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

let timeout
const mapboxToken = process.env.MAPBOX_TOKEN

/*
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
*/

const mutation = gql`
  mutation($id: ID!, $name: String, $locationName: String, $about: String) {
    UpdateUser(id: $id, name: $name, locationName: $locationName, about: $about) {
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
      loadingData: false,
      loadingGeo: false,
      formData: {},
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    form: {
      get: function() {
        const { name, locationName, about } = this.currentUser
        return { name, locationName, about }
      },
      set: function(formData) {
        this.formData = formData
      },
    },
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async submit() {
      this.loadingData = true
      const { name, about } = this.formData
      let { locationName } = this.formData
      locationName = locationName && (locationName['label'] || locationName)
      try {
        await this.$apollo.mutate({
          mutation,
          variables: {
            id: this.currentUser.id,
            name,
            locationName,
            about,
          },
          update: (store, { data: { UpdateUser } }) => {
            const { name, locationName, about } = UpdateUser
            this.setCurrentUser({
              ...this.currentUser,
              name,
              locationName,
              about,
            })
          },
        })
        this.$toast.success(this.$t('settings.data.success'))
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.loadingData = false
      }
    },
    handleCityInput(value) {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.requestGeoData(value), 500)
    },
    processCityResults(res) {
      if (!res || !res.data || !res.data.features || !res.data.features.length) {
        return []
      }
      let output = []
      res.data.features.forEach(item => {
        output.push({
          label: item.place_name,
          value: item.place_name,
          id: item.id,
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

      this.loadingGeo = true
      this.axiosSource = CancelToken.source()

      const place = encodeURIComponent(value)
      const lang = this.$i18n.locale()

      this.$axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${mapboxToken}&types=region,place,country&language=${lang}`,
          {
            cancelToken: this.axiosSource.token,
          },
        )
        .then(res => {
          this.cities = this.processCityResults(res)
        })
        .finally(() => {
          this.loadingGeo = false
        })
    },
  },
}
</script>
