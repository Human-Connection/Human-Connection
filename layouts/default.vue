<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container style="padding: .5rem 3rem .2rem;">
        <a
          v-router-link
          href="/">
          <ds-logo />
        </a>
        <a
          v-router-link
          :href="$router.resolve({name: 'profile-slug', params: {slug: user.slug}}).href">
          <ds-avatar
            :image="user.avatar"
            :name="user.name"
            style="float: right"
            size="42" />
        </a>
      </ds-container>
    </div>
    <ds-container>
      <div style="padding: 6rem 2rem 5rem;">
        <nuxt/>
      </div>
    </ds-container>
  </div>
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.getters['auth/user']
    }
  }
}
</script>
