import createPasswordReset from './createPasswordReset'

describe('createPasswordReset', () => {
  const issuedAt = new Date()
  const nonce = 'abcdef'

  describe('email lookup', () => {
    let driver
    let mockSession
    beforeEach(() => {
      mockSession = {
        close() {},
        run: jest.fn().mockReturnValue({
          records: {
            map: jest.fn(() => []),
          },
        }),
      }
      driver = { session: () => mockSession }
    })

    it('lowercases email address', async () => {
      const email = 'stRaNGeCaSiNG@ExAmplE.ORG'
      await createPasswordReset({ driver, email, issuedAt, nonce })
      expect(mockSession.run.mock.calls).toEqual([
        [
          expect.any(String),
          expect.objectContaining({
            email: 'strangecasing@example.org',
          }),
        ],
      ])
    })
  })
})
