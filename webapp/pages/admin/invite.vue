<template>
  <ds-section>
    <ds-space>
      <ds-heading size="h3">
        {{ $t('admin.invites.title') }}
      </ds-heading>
      <ds-text>
        {{ $t('admin.invites.description') }}
      </ds-text>
    </ds-space>
    <signup />
  </ds-section>
</template>

<script>
import Signup from '~/components/Registration/Signup'

export default {
  components: {
    Signup,
  },
}
</script>
