<template>
  <div class="donation-info">
    <progress-bar :title="title" :label="label" :goal="goal" :progress="progress" />
    <a href="https://human-connection.org/spenden/">
      <ds-button primary>{{ $t('donations.donate-now') }}</ds-button>
    </a>
  </div>
</template>

<script>
import ProgressBar from '~/components/ProgressBar/ProgressBar.vue'

export default {
  components: {
    ProgressBar,
  },
  // TODO: get values from state / database? --> should not be props and not have defaults
  props: {
    goal: {
      type: Number,
      default: 15000,
    },
    progress: {
      type: Number,
      default: 500,
    },
  },
  computed: {
    title() {
      const today = new Date()
      const month = today.toLocaleString(this.$i18n.locale(), { month: 'long' })
      return `${this.$t('donations.donations-for')} ${month}`
    },
    label() {
      return this.$t('donations.amount-of-total', {
        amount: this.progress.toLocaleString(this.$i18n.locale()),
        total: this.goal.toLocaleString(this.$i18n.locale()),
      })
    },
  },
}
</script>

<style lang="scss">
.donation-info {
  display: flex;
  align-items: flex-end;
  height: 100%;
}
</style>
