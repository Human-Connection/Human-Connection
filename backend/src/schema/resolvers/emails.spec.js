describe('AddEmailAddress', () => {
  it.todo('throws AuthorizationError')
  describe('authenticated', () => {
    it.todo('creates a new unverified `EmailAddress` node')
    it.todo('connects EmailAddress to the authenticated user')

    describe('even if an unverified `EmailAddress` already exists with that email', () =>{
      it.todo('creates a new unverified `EmailAddress` node')
    })
  })
})

describe('VerifyEmailAddress', () => {
  it.todo('throws AuthorizationError')
  describe('authenticated', () => {
    describe('if no unverified `EmailAddress` node exists', () => {
      it.todo('throws UserInputError')
    })

    describe('given invalid nonce', () => {
      it.todo('throws UserInputError')
    })

    describe('given valid nonce for unverified `EmailAddress` node', () => {
      describe('but the address does not belong to the authenticated user', () => {
        it.todo('throws UserInputError')
      })

      describe('and the `EmailAddress` belongs to the authenticated user', () => {
        it.todo('verifies the `EmailAddress`')
        it.todo('connects the new `EmailAddress` as PRIMARY')
        it.todo('removes previous PRIMARY relationship')
      })
    })
  })
})
