<template>
  <ds-form
    class="organization-form"
    ref="organizationForm"
    v-model="formData"
    :schema="formSchema"
    @submit="submit"
  >
    <template #default="{ errors }">
      <base-card>
        <template #heroImage>
          <img v-if="formData.image" :src="formData.image | proxyApiUrl" :class="['image']" />
          <image-uploader
            :hasImage="!!formData.image"
            @addHeroImage="addHeroImage"
            @addImageAspectRatio="addImageAspectRatio"
          />
        </template>
        <ds-input
          model="name"
          :placeholder="$t('organizations.form.name')"
          name="name"
          autofocus
          size="large"
        />
        <ds-chip size="base" :color="errors && errors.name && 'danger'">
          {{ formData.name.length }}/{{ formSchema.name.max }}
          <base-icon v-if="errors && errors.name" name="warning" />
        </ds-chip>
        <ds-select
          class="organization-space-bottom"
          id="city"
          model="locationName"
          icon="map-marker"
          :options="cities"
          :label="$t('organizations.form.labelCity')"
          :placeholder="$t('organizations.form.labelCity')"
          :loading="loadingGeo"
          @input.native="handleCityInput"
        />
        <hc-editor
          :users="users"
          :value="formData.description"
          :hashtags="hashtags"
          @input="updateEditorContent"
        />
        <ds-space margin="large" />
        <categories-select model="categoryIds" :existingCategoryIds="formData.categoryIds" />
        <ds-chip size="base" :color="errors && errors.categoryIds && 'danger'">
          {{ formData.categoryIds.length }} / 3
          <base-icon v-if="errors && errors.categoryIds" name="warning" />
        </ds-chip>
        <div class="buttons">
          <base-button data-test="cancel-button" :disabled="loading" @click="$router.back()" danger>
            {{ $t('actions.cancel') }}
          </base-button>
          <base-button type="submit" icon="check" :loading="loading" :disabled="errors" filled>
            {{ $t('actions.save') }}
          </base-button>
        </div>
      </base-card>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import { CancelToken } from 'axios'
import { mapGetters } from 'vuex'
import HcEditor from '~/components/Editor/Editor'
import OrganizationMutations from '~/graphql/OrganizationMutations.js'
import CategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'
import ImageUploader from '~/components/ImageUploader/ImageUploader'

let timeout
const mapboxToken = process.env.MAPBOX_TOKEN

export default {
  components: {
    HcEditor,
    CategoriesSelect,
    ImageUploader,
  },
  props: {
    organization: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const { name, description, image, categories, locationName } = this.organization

    const { aspectRatio: imageAspectRatio = null } = image || {}

    return {
      formData: {
        name: name || '',
        description: description || '',
        image: image || null,
        imageAspectRatio,
        locationName: locationName || '',
        categoryIds: categories ? categories.map((category) => category.id) : [],
      },
      formSchema: {
        name: { required: true, min: 3, max: 100 },
        description: { required: false },
        categoryIds: {
          type: 'array',
          required: true,
          validator: (_, value = []) => {
            if (value.length === 0 || value.length > 3) {
              return [new Error(this.$t('common.validations.categories'))]
            }
            return []
          },
        },
      },
      loading: false,
      users: [],
      hashtags: [],
      imageUpload: null,
      cities: [],
      loadingGeo: false,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  methods: {
    submit() {
      let image = null
      const { name, description, categoryIds } = this.formData
      const locationName = this.formData.locationName.label || this.formData.locationName
      if (this.formData.image) {
        image = {
          sensitive: null,
        }
        if (this.imageUpload) {
          image.upload = this.imageUpload
          image.aspectRatio = this.formData.imageAspectRatio
        }
      }
      this.loading = true
      this.$apollo
        .mutate({
          mutation: this.organization.id
            ? OrganizationMutations().UpdateOrganization
            : OrganizationMutations().CreateOrganization,
          variables: {
            name,
            description,
            categoryIds,
            id: this.organization.id || null,
            image,
            locationName,
          },
        })
        .then(({ data }) => {
          this.loading = false
          this.$toast.success(this.$t('organizations.form.success'))
          const result = data[this.organization.id ? 'UpdateOrganization' : 'CreateOrganization']

          this.$router.push({
            name: 'organization-id-slug',
            params: { id: result.id, slug: result.slug },
          })
        })
        .catch((err) => {
          this.$toast.error(err.message)
          this.loading = false
        })
    },
    updateEditorContent(value) {
      this.$refs.organizationForm.update('description', value)
    },
    addHeroImage(file) {
      this.formData.image = null
      if (file) {
        const reader = new FileReader()
        reader.onload = ({ target }) => {
          this.formData.image = {
            ...this.formData.image,
            url: target.result,
          }
        }
        reader.readAsDataURL(file)
        this.imageUpload = file
      }
    },
    addImageAspectRatio(aspectRatio) {
      this.formData.imageAspectRatio = aspectRatio
    },
    handleCityInput(value) {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.requestGeoData(value), 500)
    },
    processCityResults(res) {
      if (!res || !res.data || !res.data.features || !res.data.features.length) {
        return []
      }
      const output = []
      res.data.features.forEach((item) => {
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
        .then((res) => {
          this.cities = this.processCityResults(res)
        })
        .finally(() => {
          this.loadingGeo = false
        })
    },
  },
  apollo: {
    User: {
      query() {
        return gql`
          query {
            User(orderBy: slug_asc) {
              id
              slug
            }
          }
        `
      },
      result({ data: { User } }) {
        this.users = User
      },
    },
    Tag: {
      query() {
        return gql`
          query {
            Tag(orderBy: id_asc) {
              id
            }
          }
        `
      },
      result({ data: { Tag } }) {
        this.hashtags = Tag
      },
    },
  },
}
</script>

<style lang="scss">
.organization-form > .base-card {
  display: flex;
  flex-direction: column;

  > .hero-image {
    position: relative;

    > .image {
      max-height: $size-image-max-height;
    }
  }

  .image.--blur-image {
    filter: blur($blur-radius);
  }

  > .ds-form-item {
    margin: 0;
  }

  > .ds-chip {
    align-self: flex-end;
    margin: $space-xx-small 0 $space-base;
    cursor: default;
  }

  > .select-field {
    align-self: flex-end;
  }

  > .organization-space-bottom {
    margin-bottom: $space-base;
  }

  > .buttons {
    align-self: flex-end;
    margin-top: $space-base;
  }

  .blur-toggle {
    text-align: right;
    margin-bottom: $space-base;

    > .link {
      display: block;
    }
  }
}
</style>
