describe('login', () => {
  describe('asking for a `token`', () => {
    describe('with valid email/password combination', () => {
      xit('responds with a JWT token', () => {})
    })

    describe('with a valid email but incorrect password', () => {
      beforeEach(() => {
        // create a user in the database
      })
      xit('responds with "Wrong email/password combination"', () => {})
    })

    describe('with a non-existing email', () => {
      xit('responds with "Wrong email/password combination"', () => {})
    })
  })
})
