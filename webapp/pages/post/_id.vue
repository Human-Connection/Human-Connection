<template>
  <div>
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
        <transition
          name="slide-up"
          appear
        >
          <nuxt-child />
        </transition>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '200px' }">
        <ds-menu :routes="routes" />
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const queryId = gql`
  query($idOrSlug: ID) {
    Post(id: $idOrSlug) {
      id
      slug
    }
  }
`
const querySlug = gql`
  query($idOrSlug: String) {
    Post(slug: $idOrSlug) {
      id
      slug
    }
  }
`

export default {
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
              path: `/post/${id}/${slug}#comments`
            },
            {
              name: this.$t('common.letsTalk'),
              path: `/post/${id}/${slug}#lets-talk`
            },
            {
              name: this.$t('common.versus'),
              path: `/post/${id}/${slug}#versus`
            }
          ]
        },
        {
          name: this.$t('common.moreInfo'),
          path: `/post/${id}/${slug}/more-info`
        },
        {
          name: this.$t('common.takeAction'),
          path: `/post/${id}/${slug}/take-action`
        }
      ]
    }
  },
  async asyncData(context) {
    const {
      params: { id, slug },
      redirect,
      error,
      app: { apolloProvider }
    } = context
    const idOrSlug = id

    const variables = { idOrSlug }
    const client = apolloProvider.defaultClient

    let response
    let post
    response = await client.query({ query: queryId, variables })
    post = response.data.Post[0]
    if (post && post.slug === slug) return // all good
    if (post && post.slug !== slug) redirect(`/post/${post.id}/${post.slug}`)

    response = await client.query({ query: querySlug, variables })
    post = response.data.Post[0]
    if (post) redirect(`/post/${post.id}/${post.slug}`)

    return error({ statusCode: 404 })
  }
}
</script>
