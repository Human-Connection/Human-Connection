<template>
  <ds-flex :width="{ base: '100%' }" gutter="base">
    <ds-flex-item :width="{ base: '100%', md: 5 }">
      <organization-form />
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', md: 1 }">&nbsp;</ds-flex-item>
  </ds-flex>
</template>

<script>
import OrganizationForm from '~/components/OrganizationForm/OrganizationForm'

export default {
  components: {
    OrganizationForm,
  },
}
</script>
