<template>
  <div>
    <ds-card hover>
      <ds-space />
      <ds-form v-model="formData">
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-flex-item>
            <ds-icon name="warning" size="xxx-large" class="delete-warning-icon" />
          </ds-flex-item>
          <ds-flex-item width="80%">
            <ds-heading>{{ $t('settings.delete.name') }}</ds-heading>
          </ds-flex-item>
          <ds-container>
            <ds-space />
            <ds-heading tag="h3">
              This is a destructive action and to proceed you must choose to take this action by
              selecting the 'I really want to delete my account' from the dropdown This cannot be
              undone, please consider your actions carefully!
            </ds-heading>
          </ds-container>
        </ds-flex>
        <ds-space />
        <ds-section>
          <ds-flex>
            <ds-flex-item width="50%">
              <ds-select
                v-model="accept"
                :options="['', 'I really want to delete my account']"
                @input="enableDeletion"
                placeholder="Are you sure you want to delete your account?"
              />
            </ds-flex-item>
            <ds-flex-item width="10%" />
            <ds-flex-item>
              <ds-button icon="trash" danger :disabled="disabled">
                {{ $t('settings.delete.name') }}
              </ds-button>
            </ds-flex-item>
          </ds-flex>
        </ds-section>
      </ds-form>
    </ds-card>
  </div>
</template>
<script>
export default {
  name: 'DeleteAccount',
  data() {
    return {
      formData: {},
      accept: null,
      disabled: true,
    }
  },
  methods: {
    enableDeletion() {
      if (this.accept === 'I really want to delete my account') {
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
  },
}
</script>
<style lang="scss">
.delete-warning-icon {
  color: $color-danger;
}
</style>
