<template>
  <transition name="fade" appear>
    <base-card
      v-if="organization && ready"
      :class="{
        'organization-page': true,
      }"
      :style="heroImageStyle"
    >
      <template #heroImage v-if="organization.image">
        <img :src="organization.image | proxyApiUrl" class="image" />
      </template>
      <section class="menu">
        <user-teaser :user="organization.creator" :date-time="organization.createdAt">
          <template #dateTime>
            <ds-text v-if="organization.createdAt !== organization.updatedAt">
              ({{ $t('post.edited') }})
            </ds-text>
          </template>
        </user-teaser>
        <client-only>
          <content-menu
            placement="bottom-end"
            resource-type="organization"
            :resource="organization"
            :modalsData="menuModalsData"
            :is-owner="isAuthor"
          />
        </client-only>
      </section>
      <ds-space margin-bottom="small" />
      <h2 class="title hyphenate-text">{{ organization.name }}</h2>
      <ds-space margin-bottom="small" />
      <ds-text v-if="organization.location" align="center" color="soft" size="small">
        <base-icon name="map-marker" />
        {{ organization.location.name }}
      </ds-text>
      <ds-space margin-bottom="small" />
      <content-viewer class="content hyphenate-text" :content="organization.description" />
      <!-- eslint-enable vue/no-v-html -->
      <ds-space margin="xx-large" />
      <!-- Categories -->
      <div class="categories">
        <ds-space margin="xx-small" />
        <hc-category
          v-for="category in organization.categories"
          :key="category.id"
          :icon="category.icon"
          :name="$t(`contribution.category.name.${category.slug}`)"
        />
      </div>
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <div v-if="organization.tags && organization.tags.length" class="tags">
        <ds-space margin="xx-small" />
        <hc-hashtag v-for="tag in sortedTags" :key="tag.id" :id="tag.id" />
      </div>
    </base-card>
  </transition>
</template>

<script>
import ContentViewer from '~/components/Editor/ContentViewer'
import HcCategory from '~/components/Category'
import HcHashtag from '~/components/Hashtag/Hashtag'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import OrganizationQuery from '~/graphql/OrganizationQuery'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import {
  postMenuModalsData,
  deletePostMutation,
  sortTagsAlphabetically,
} from '~/components/utils/PostHelpers'

export default {
  name: 'OrganizationSlug',
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  components: {
    HcCategory,
    HcHashtag,
    UserTeaser,
    ContentMenu,
    ContentViewer,
  },
  head() {
    return {
      title: this.name,
    }
  },
  data() {
    return {
      organization: null,
      ready: false,
      title: 'loading',
      blurred: false,
      blocked: null,
    }
  },
  mounted() {
    setTimeout(() => {
      // NOTE: quick fix for jumping flexbox implementation
      // will be fixed in a future update of the styleguide
      this.ready = true
    }, 50)
  },
  computed: {
    menuModalsData() {
      return postMenuModalsData(
        // "this.organization" may not always be defined at the beginning …
        this.organization ? this.$filters.truncate(this.organization.title, 30) : '',
        this.deletePostCallback,
      )
    },
    isAuthor() {
      const { creator } = this.organization
      if (!creator) return false
      return this.$store.getters['auth/user'].id === creator.id
    },
    sortedTags() {
      return sortTagsAlphabetically(this.organization.tags)
    },
    heroImageStyle() {
      /*  Return false when image property is not present or is not a number
          so no unnecessary css variables are set.
        */
      if (!this.organization.image || typeof this.organization.image.aspectRatio !== 'number')
        return false

      /*  Return the aspect ratio as a css variable. Later to be used when calculating
          the height with respect to the width.
        */
      return {
        '--hero-image-aspect-ratio': 1 / this.organization.image.aspectRatio,
      }
    },
  },
  methods: {
    async deletePostCallback() {
      try {
        await this.$apollo.mutate(deletePostMutation(this.post.id))
        this.$toast.success(this.$t('delete.contribution.success'))
        this.$router.history.push('/') // Redirect to index (main) page
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
  apollo: {
    Organization: {
      query() {
        return OrganizationQuery(this.$i18n)
      },
      variables() {
        return {
          id: this.$route.params.id,
        }
      },
      update({ Organization }) {
        this.organization = Organization[0] || {}
        this.name = this.organization.name
        const { image } = this.organization
        this.creator = this.organization.creator
        this.blurred = image && image.sensitive
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
<style lang="scss">
.organization-page {
  > .hero-image {
    position: relative;
    /*  The padding top makes sure the correct height is set (according to the
        hero image aspect ratio) before the hero image loads so
        the autoscroll works correctly when following a comment link. 
      */
    padding-top: calc(var(--hero-image-aspect-ratio) * 100%);
    width: 100%;

    /*  Letting the image fill the container, since the container
        is the one determining height
      */
    > .image {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }

  > .menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .comments {
    margin-top: $space-small;

    .ProseMirror {
      min-height: 0px;
    }
  }
}

@media only screen and (max-width: 960px) {
  .shout-button {
    float: left;
  }
}
</style>
