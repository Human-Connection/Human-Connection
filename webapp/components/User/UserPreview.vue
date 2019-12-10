<template>
  <div>
    <hc-avatar v-if="showAvatar" class="user-preview-avatar" :user="user" />
    <div>
      <ds-text class="user-preview-info">
        <b>{{ userSlug }}</b>
      </ds-text>
    </div>
    <ds-text data-test="username" align="left" size="small" color="soft">
      {{ userName | truncate(18) }}
      <template v-if="dateTime">
        <base-icon name="clock" />
        <hc-relative-date-time :date-time="dateTime" />
        <slot name="dateTime"></slot>
      </template>
    </ds-text>
  </div>
</template>

<script>
import HcAvatar from '~/components/Avatar/Avatar.vue'
import HcRelativeDateTime from '~/components/RelativeDateTime'

export default {
  components: {
    HcRelativeDateTime,
    HcAvatar,
  },
  props: {
    user: { type: Object, default: null },
    showAvatar: { type: Boolean, default: true },
    dateTime: { type: [Date, String], default: null },
  },
  computed: {
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
    userSlug() {
      const { slug } = this.user || {}
      return slug && `@${slug}`
    },
  },
}
</script>
<style lang="scss">
.user-preview {
  &-avatar {
    float: left;
    margin-right: 4px;
    height: 100%;
    vertical-align: middle;
  }

  &-info {
    display: flex;
    align-items: center;

    > .ds-text {
      display: flex;
      align-items: center;
      margin-left: $space-xx-small;
    }
  }
}
</style>
