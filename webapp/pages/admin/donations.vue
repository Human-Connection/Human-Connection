<template>
  <ds-card :header="$t('admin.donations.name')">
    <ds-form v-model="formData" @submit="submit">
      <ds-input model="goal" :label="$t('admin.donations.goal')" placeholder="15000" icon="money" />
      <ds-input
        model="progress"
        :label="$t('admin.donations.progress')"
        placeholder="1200"
        icon="money"
      />
      <ds-button primary type="submit" :disabled="!formData.goal || !formData.progress">
        {{ $t('actions.save') }}
      </ds-button>
    </ds-form>
  </ds-card>
</template>

<script>
import { DonationsQuery, UpdateDonations } from '~/graphql/Donations'

export default {
  data() {
    return {
      formData: {
        goal: null,
        progress: null,
      },
    }
  },
  methods: {
    submit() {
      const { goal, progress } = this.formData
      this.$apollo
        .mutate({
          mutation: UpdateDonations(),
          variables: {
            goal: parseInt(goal),
            progress: parseInt(progress),
          },
        })
        .then(() => {
          this.$toast.success(this.$t('admin.donations.successfulUpdate'))
        })
        .catch(error => this.$toast.error(error.message))
    },
  },
  apollo: {
    Donations: {
      query() {
        return DonationsQuery()
      },
      update({ Donations }) {
        if (!Donations[0]) return
        const { goal, progress } = Donations[0]
        this.formData = {
          goal,
          progress,
        }
      },
    },
  },
}
</script>
