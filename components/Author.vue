<template>
  <v-popover
    :open.sync="isPopoverOpen"
    :disabled="!hasAuthor || !showAuthorPopover"
    :open-group="Math.random()"
    placement="top-start"
    trigger="manual"
    offset="5">
    <a
      v-router-link
      :href="author.slug ? $router.resolve({ name: 'profile-slug', params: { slug: author.slug } }).href : null"
      @mouseover="popoverMouseEnter"
      @mouseleave="popoveMouseLeave">
      <ds-avatar
        :image="author.avatar"
        :name="author.name"
        size="32px" /> <b class="username">{{ author.name }}</b>
    </a>
    <div
      slot="popover"
      style="min-width: 250px;"
      @mouseover="popoverMouseEnter"
      @mouseleave="popoveMouseLeave">
      <ds-flex>
        <ds-flex-item class="ds-tab-nav-item ds-tab-nav-item-active">
          <ds-space margin="small">
            <ds-text
              size="x-large"
              style="margin-bottom: 0; text-align: center">{{ author.contributionsCount }}</ds-text>
            <ds-text
              size="small"
              style="text-align: center">Beiträge</ds-text>
          </ds-space>
        </ds-flex-item>
        <ds-flex-item class="ds-tab-nav-item">
          <ds-space margin="small">
            <ds-text
              size="x-large"
              style="margin-bottom: 0; text-align: center">{{ author.commentsCount }}</ds-text>
            <ds-text
              size="small"
              style="text-align: center">Kommentare</ds-text>
          </ds-space>
        </ds-flex-item>
        <ds-flex-item class="ds-tab-nav-item">
          <ds-space margin="small">
            <ds-text
              size="x-large"
              style="margin-bottom: 0; text-align: center">{{ author.followedByCount }}</ds-text>
            <ds-text
              size="small"
              style="text-align: center">Fans</ds-text>
          </ds-space>
        </ds-flex-item>
      </ds-flex>
      <ds-flex
        gutter="x-small"
        style="margin-bottom: 0;">
        <ds-flex-item :width="{base: 3}">
          <hc-follow-button :follow-id="author.id" />
        </ds-flex-item>
        <ds-flex-item :width="{base: 1}" >
          <ds-button full-width>
            <ds-icon name="user-times"/>
          </ds-button>
        </ds-flex-item>
      </ds-flex>
      <!--<ds-space margin-bottom="x-small" />-->
    </div>
  </v-popover>
</template>

<script>
import HcFollowButton from '~/components/FollowButton.vue'

let mouseEnterTimer = null
let mouseLeaveTimer = null

export default {
  name: 'HcAuthor',
  components: {
    HcFollowButton
  },
  props: {
    post: { type: Object, default: null },
    showAuthorPopover: { type: Boolean, default: true }
  },
  data() {
    return {
      isPopoverOpen: false
    }
  },
  computed: {
    author() {
      return this.hasAuthor
        ? this.post.author.User
        : {
            name: 'Anonymus'
          }
    },
    hasAuthor() {
      return Boolean(this.post && this.post.author)
    }
  },
  beforeDestroy() {
    clearTimeout(mouseEnterTimer)
    clearTimeout(mouseLeaveTimer)
  },
  methods: {
    popoverMouseEnter() {
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (!this.isPopoverOpen) {
        mouseEnterTimer = setTimeout(() => {
          this.isPopoverOpen = true
        }, 500)
      }
    },
    popoveMouseLeave() {
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (this.isPopoverOpen) {
        mouseLeaveTimer = setTimeout(() => {
          this.isPopoverOpen = false
        }, 300)
      }
    }
  }
}
</script>
