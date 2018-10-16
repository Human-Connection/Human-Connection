<template>
  <v-popover
    :open.sync="isPopoverOpen"
    :disabled="!hasAuthor || !showAuthorPopover"
    :open-group="Math.random().toString()"
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
        size="32px" /> <b class="username">{{ author.name | truncate(trunc) }}</b>
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
              style="margin-bottom: 0; text-align: center">{{ fanCount }}</ds-text>
            <ds-text
              size="small"
              style="text-align: center">Fans</ds-text>
          </ds-space>
        </ds-flex-item>
      </ds-flex>
      <!--<ds-text
        color="soft"
        size="small">
        <ds-icon name="map-marker" /> Hamburg, Deutschland
      </ds-text>-->
      <ds-flex
        gutter="x-small"
        style="margin-bottom: 0;">
        <ds-flex-item :width="{base: 3}">
          <hc-follow-button
            :follow-id="author.id"
            @update="voted = true" />
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
    trunc: { type: Number, default: null },
    showAuthorPopover: { type: Boolean, default: true }
  },
  data() {
    return {
      isPopoverOpen: false,
      voted: false
    }
  },
  computed: {
    fanCount() {
      let count = Number(this.author.followedByCount) || 0
      if (this.voted) {
        // NOTE: this is used for presentation
        count += 1
      }
      return count
    },
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
