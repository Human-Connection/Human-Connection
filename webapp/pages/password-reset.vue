<template>
  <ds-container width="medium">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <nuxt-child />
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>

<script>
export default {
  layout: 'no-header',
  asyncData({ store, redirect }) {
    if (store.getters['auth/isLoggedIn']) {
      redirect('/')
    }
  },
}
</script>
