<template>
  <ds-avatar
    :image="user && user.avatar | proxyApiUrl"
    :name="userName"
    class="avatar"
    :size="size"
  />
</template>

<script>
export default {
  name: 'HcAvatar',
  props: {
    user: { type: Object, default: null },
    size: { type: String, default: 'small' },
  },
  computed: {
    userName() {
      const { name } = this.user || {}
      // The name is used to display the initials in case
      // the image cannot be loaded.
      return name
      // If the name is undefined, then our styleguide will
      // display an icon for the anonymous user.
    },
  },
}
</script>
