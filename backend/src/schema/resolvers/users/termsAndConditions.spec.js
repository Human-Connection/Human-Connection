describe('SignupVerification', () => {
  describe('given a valid version', () => {
    // const version = '1.2.3'

    it.todo('saves the version with the new created user account')
    it.todo('saves the current datetime in `termsAndConditionsAgreedAt`')
  })

  describe('given an invalid version string', () => {
    // const version = 'this string does not follow semantic versioning'

    it.todo('rejects')
  })
})

describe('UpdateUser', () => {
  describe('given a new agreed version of terms and conditions', () => {
    it.todo('updates `termsAndConditionsAgreedAt`')
    it.todo('updates `termsAndConditionsAgreedVersion`')
  })
})
