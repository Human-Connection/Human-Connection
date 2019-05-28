<template>
  <ds-card>
    <ds-form>
    <ds-radio buttons v-model="filter" label="Filter" :options="['friends', 'friends-of-a-friend', 'all']" />
    </ds-form>
  </ds-card>
</template>

<script>
import Dropdown from '~/components/Dropdown'
export default {
  components: {
    Dropdown
  },
  data() {
    return {
      filter: 'all'
    }
  }
}
</script>
