<template>
  <ds-form
    v-model="formData"
    :schema="formSchema"
    @submit="handleSubmit"
    @input="validate"
  >
    <template>
      <ds-input
        id="oldPassword"
        model="oldPassword"
        type="password"
        label="Your old password"
      />
      <ds-input
        id="newPassword"
        model="newPassword"
        type="password"
        label="Your new password"
      />
      <ds-input
        id="passwordConfirmation"
        model="passwordConfirmation"
        type="password"
        label="Confirm new password"
      />
      <ds-space margin-top="base">
        <ds-button primary>
          Submit
        </ds-button>
      </ds-space>
    </template>
  </ds-form>
</template>

<script>
export default {
  name: 'ChangePassword',
  data() {
    return {
      formData: {
        oldPassword: '',
        newPassword: '',
        passwordConfirmation: ''
      },
      formSchema: {
        oldPassword: { required: true },
        newPassword: { required: true },
        passwordConfirmation: { required: true }
      },
      disabled: true
    }
  },
  methods: {
    validate(data) {
      console.log('validate')
      console.log(data)
    },
    handleSubmit(data) {
      console.log('handleSubmit')
      console.log(data)
    }
  }
}
</script>
