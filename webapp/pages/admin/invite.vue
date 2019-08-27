<template>
  <!-- This registration form will be visible to the public as soon as the registration is open to the public. -->
  <ds-section>
    <ds-space>
      <ds-heading size="h3">{{ $t('admin.invites.title') }}</ds-heading>
      <ds-text>{{ $t('admin.invites.description') }}</ds-text>
    </ds-space>
    <signup :invitation="true" />
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
