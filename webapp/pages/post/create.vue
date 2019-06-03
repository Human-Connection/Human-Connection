<template>
  <ds-flex :width="{ base: '100%' }"
gutter="base">
    <ds-flex-item :width="{ base: '100%', md: 3 }">
      <hc-contribution-form />
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', md: 1 }">
      &nbsp;
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import HcContributionForm from '~/components/ContributionForm'

export default {
  components: {
    HcContributionForm,
  },
}
</script>
