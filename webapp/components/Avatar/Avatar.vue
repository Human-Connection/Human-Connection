<template>
  <ds-avatar
    :image="avatarUrl"
    :name="userName"
    style="display: inline-block; vertical-align: middle;"
    size="small"
  />
</template>

<script>
export default {
  name: 'HcAvatar',
  props: {
    user: { type: Object, default: null },
  },
  computed: {
    avatarUrl() {
      const { avatar: imageSrc } = this.user || {}
      if (!imageSrc) return imageSrc
      return imageSrc.startsWith('/') ? imageSrc.replace('/', '/api/') : imageSrc
    },
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
