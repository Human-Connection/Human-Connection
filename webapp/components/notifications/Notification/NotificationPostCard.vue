<template>
  <ds-card
    :header="post.title"
    :image="post.image"
    :class="{'post-card': true, 'disabled-content': post.disabled}"
    hover
    space="x-small"
  >
    <nuxt-link
      class="post-link"
      :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
    >
      {{ post.title }}
    </nuxt-link>
    <ds-space margin-bottom="x-small" />
    <no-ssr>
      <hc-user
        :user="post.author"
        :trunc="35"
      />
    </no-ssr>
    <ds-space margin-bottom="x-small" />
    <!-- eslint-disable vue/no-v-html -->
    <!-- TODO: replace editor content with tiptap render view -->
    <div
      class="hc-editor-content"
      v-html="excerpt"
    />
    <!-- eslint-enable vue/no-v-html -->
  </ds-card>
</template>

<script>
import HcUser from '~/components/User'

export default {
  name: 'HcPostCard',
  components: {
    HcUser
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  computed: {
    excerpt() {
      const { contentExcerpt } = this.post
      if (!contentExcerpt) return ''
      // remove all links from excerpt to prevent issues with the sorrounding link
      let excerpt = contentExcerpt.replace(/<a.*>(.+)<\/a>/gim, '$1')
      // do not display content that is only linebreaks
      if (excerpt.replace(/<br>/gim, '').trim() === '') {
        excerpt = ''
      }

      return excerpt
    }
  },
  methods: {
    href(post) {
      return this.$router.resolve({
        name: 'post-id-slug',
        params: { id: post.id, slug: post.slug }
      }).href
    }
  }
}
</script>

<style lang="scss">
.post-card {
  cursor: pointer;
  position: relative;
  z-index: 1;

  .post-link {
    margin: 15px;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-indent: -999999px;
  }
}
</style>
