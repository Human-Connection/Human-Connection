<template>
  <div>
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
        <transition name="slide-up" appear>
          <nuxt-child />
        </transition>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '200px' }">
        <ds-menu :routes="routes" class="post-side-navigation" />
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import PersistentLinks from '~/mixins/persistentLinks.js'

const options = {
  queryId: gql`
    query($idOrSlug: ID) {
      Post(id: $idOrSlug) {
        id
        slug
      }
    }
  `,
  querySlug: gql`
    query($idOrSlug: String) {
      Post(slug: $idOrSlug) {
        id
        slug
      }
    }
  `,
  path: 'post',
  message: 'This post could not be found',
}
const persistentLinks = PersistentLinks(options)

export default {
  mixins: [persistentLinks],
  computed: {
    routes() {
      const { slug, id } = this.$route.params
      return [
        {
          name: this.$t('common.post', null, 1),
          path: `/post/${id}/${slug}`,
          children: [
            {
              name: this.$t('common.comment', null, 2),
              path: `/post/${id}/${slug}#comments`,
            },
            // TODO implement
            /* {
              name: this.$t('common.letsTalk'),
              path: `/post/${id}/${slug}#lets-talk`
            }, */
            // TODO implement
            /* {
              name: this.$t('common.versus'),
              path: `/post/${id}/${slug}#versus`
            } */
          ],
        },
        {
          name: this.$t('common.moreInfo'),
          path: `/post/${id}/${slug}/more-info`,
        },
        // TODO implement
        /* {
          name: this.$t('common.takeAction'),
          path: `/post/${id}/${slug}/take-action`
        } */
      ]
    },
  },
}
</script>

<style lang="scss">
.post-side-navigation {
  position: sticky;
  top: 65px;
  z-index: 2;
}
</style>
