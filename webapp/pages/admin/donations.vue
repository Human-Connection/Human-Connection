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
import { UpdateDonations } from '~/graphql/Donations'

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
      const { goal, progress } = this
      this.$apollo
        .mutate({
          mutation: UpdateDonations(),
          variables: {
            goal,
            progress,
          },
        })
        .then(() => {
          this.$toast.success('yay!!')
        })
        .catch(error => this.$toast.error(error.message))
    },
  },
}
</script>
