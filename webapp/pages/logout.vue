<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item
        :width="{ base: '100%' }"
        centered
      >
        <ds-space
          style="text-align: center;"
          margin-top="large"
          margin-bottom="xxx-small"
          centered
        >
          <hc-image
            style="width: 200px;"
            :image-props="imageProps"
            alt="Human Connection"
          />
        </ds-space>
        <ds-space
          style="text-align: center;"
          margin-top="small"
          margin-bottom="xxx-small"
          centered
        >
          <ds-heading
            tag="h3"
            soft
          >
            Logging out...
          </ds-heading>
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>

<script>
import HcImage from '~/components/Image'
export default {
  components: {
    HcImage
  },
  layout: 'blank',
  computed: {
    imageProps() {
      return { src: '/img/sign-up/onourjourney.png' }
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('auth/logout')
    this.$router.replace('/')
  }
}
</script>
