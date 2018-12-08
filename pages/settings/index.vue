<template>
  <ds-card space="small">
    <ds-input
      id="name"
      v-model="form.name"
      icon="user"
      label="Dein Name"
      placeholder="Dein Name"
    />
    <!-- eslint-disable vue/use-v-on-exact -->
    <ds-select
      id="city"
      v-model="city"
      :options="cities"
      icon="map-marker"
      label="Deine Stadt"
      placeholder="Deine Stadt"
      @input="handleCitySelection"
      @input.native="handleCityInput"
    />
    <!-- eslint-enable vue/use-v-on-exact -->
    <ds-input
      id="bio"
      v-model="form.about"
      type="textarea"
      rows="3"
      label="Erzähl doch ein wenig (in zwei Sätzen) über dich"
      placeholder="Über mich"
    />
    <template slot="footer">
      <ds-button
        style="float: right;"
        icon="check"
        primary
        @click.prevent="submit"
      >
        Speichern
      </ds-button>
    </template>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'

import { mapGetters } from 'vuex'
import { CancelToken } from 'axios'
import find from 'lodash/find'

let timeout
const mapboxToken =
  'pk.eyJ1IjoiaHVtYW4tY29ubmVjdGlvbiIsImEiOiJjajl0cnBubGoweTVlM3VwZ2lzNTNud3ZtIn0.KZ8KK9l70omjXbEkkbHGsQ'

export default {
  data() {
    return {
      axiosSource: null,
      cities: [],
      city: null,
      form: {
        name: null,
        locationId: null,
        about: null
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  },
  watch: {
    user: {
      immediate: true,
      handler: function(user) {
        this.form = {
          name: user.name,
          locationId: user.locationId,
          about: user.about
        }
      }
    }
  },
  methods: {
    submit() {
      console.log('SUBMIT', { ...this.form })
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $id: ID!
              $name: String
              $locationId: String
              $about: String
            ) {
              UpdateUser(
                id: $id
                name: $name
                locationId: $locationId
                about: $about
              ) {
                id
                name
                locationId
                about
              }
            }
          `,
          // Parameters
          variables: {
            id: this.user.id,
            name: this.form.name,
            locationId: this.form.locationId,
            about: this.form.about
          },
          // Update the cache with the result
          // The query will be updated with the optimistic response
          // and then with the real result of the mutation
          update: (store, { data: { UpdateUser } }) => {
            // this.$store.dispatch('auth/refresh', UpdateUser)
            // Read the data from our cache for this query.
            // const data = store.readQuery({ query: TAGS_QUERY })
            // Add our tag from the mutation to the end
            // data.tags.push(addTag)
            // Write our data back to the cache.
            // store.writeQuery({ query: TAGS_QUERY, data })
          }
          // Optimistic UI
          // Will be treated as a 'fake' result as soon as the request is made
          // so that the UI can react quickly and the user be happy
          /* optimisticResponse: {
            __typename: 'Mutation',
            addTag: {
              __typename: 'Tag',
              id: -1,
              label: newTag
            }
          } */
        })
        .then(data => {
          console.log(data)
          this.$toast.success('Updated user')
        })
        .catch(err => {
          console.error(err)
          this.$toast.error(err.message)
        })
    },
    handleCityInput(value) {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.requestGeoData(value), 500)
    },
    handleCitySelection(value) {
      console.log('SET CURRENT VALUE', value)
      const item = find(this.cities, { value: value })
      console.log('ID:', item.id)
      this.form.locationId = item.id
    },
    handleCityEnter() {
      console.log('SET CURRENT VALUE')
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

      this.$axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${mapboxToken}&types=region,postcode,district,place,country&language=de`,
          {
            cancelToken: this.axiosSource.token
          }
        )
        .then(res => {
          this.cities = this.processCityResults(res)
        })
      console.log('TRY TO GET DATA FOR ', value)
    }
  }
}
</script>
