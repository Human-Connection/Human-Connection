<template>
  <ds-card
    :header="post.title"
    :image="post.image"
    :class="{'post-card': true, 'disabled-content': post.disabled}"
  >
    <a
      v-router-link
      class="post-link"
      :href="href(post)"
    >{{ post.title }}</a>
    <!-- eslint-disable vue/no-v-html -->
    <!-- TODO: replace editor content with tiptap render view -->
    <ds-space margin-bottom="large">
      <div
        class="hc-editor-content"
        v-html="excerpt"
      />
    </ds-space>
    <!-- eslint-enable vue/no-v-html -->
    <ds-space>
      <ds-text
        v-if="post.createdAt"
        align="right"
        size="small"
        color="soft"
      >
        {{ post.createdAt | dateTime('dd. MMMM yyyy HH:mm') }}
      </ds-text>
    </ds-space>
    <ds-space
      margin="small"
      style="position: absolute; bottom: 44px;"
    >
      <!-- TODO: find better solution for rendering errors -->
      <no-ssr>
        <hc-user
          :user="post.author"
          :trunc="35"
        />
      </no-ssr>
    </ds-space>
    <template slot="footer">
      <div style="display: inline-block; opacity: .5;">
        <ds-icon
          v-for="category in post.categories"
          :key="category.id"
          v-tooltip="{content: category.name, placement: 'bottom-start', delay: { show: 500 }}"
          :name="category.icon"
        />&nbsp;
      </div>
      <div style="display: inline-block; float: right">
        <span :style="{ opacity: post.shoutedCount ? 1 : .5 }">
          <ds-icon name="bullhorn" />
          <small>{{ post.shoutedCount }}</small>
        </span>
        &nbsp;
        <span :style="{ opacity: post.commentsCount ? 1 : .5 }">
          <ds-icon name="comments" />
          <small>{{ post.commentsCount }}</small>
        </span>
        <no-ssr>
          <content-menu
            resource-type="contribution"
            :resource="post"
            :is-owner="isAuthor"
          />
        </no-ssr>
      </div>
    </template>
  </ds-card>
</template>

<script>
import HcUser from '~/components/User'
import ContentMenu from '~/components/ContentMenu'
import { randomBytes } from 'crypto'

export default {
  name: 'HcPostCard',
  components: {
    HcUser,
    ContentMenu
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  computed: {
    excerpt() {
      // remove all links from excerpt to prevent issues with the serounding link
      let excerpt = this.post.contentExcerpt.replace(/<a.*>(.+)<\/a>/gim, '$1')
      // do not display content that is only linebreaks
      if (excerpt.replace(/<br>/gim, '').trim() === '') {
        excerpt = ''
      }

      return excerpt
    },
    isAuthor() {
      return this.$store.getters['auth/user'].id === this.post.author.id
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

  /*.ds-card-footer {
  }*/

  .content-menu {
    display: inline-block;
    margin-left: $space-xx-small;
    margin-right: -$space-x-small;
  }

  .post-link {
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
