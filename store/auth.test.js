import { getters, mutations, actions } from './auth.js'

let state

describe('isAuthenticated', () => {
  describe('given JWT Bearer token', () => {
    test('true', () => {
      state = {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUxIiwic2x1ZyI6InBldGVyLWx1c3RpZyIsIm5hbWUiOiJQZXRlciBMdXN0aWciLCJhdmF0YXIiOiJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vdWlmYWNlcy9mYWNlcy90d2l0dGVyL25haXRhbmFtb3Jlbm8vMTI4LmpwZyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5vcmciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDUwNjMzODcsImV4cCI6MTYzMTQ2MzM4NywiYXVkIjoiaHR0cHM6Ly9uaXRyby1zdGFnaW5nLmh1bWFuLWNvbm5lY3Rpb24ub3JnIiwiaXNzIjoiaHR0cHM6Ly9hcGktbml0cm8tc3RhZ2luZy5odW1hbi1jb25uZWN0aW9uLm9yZyIsInN1YiI6InUxIn0.BQEoC3J6uRqMvIVfHYmMbmfMR2BudiG5Xvn8mfcc0Kk'
      }
      expect(getters.isAuthenticated(state)).toBe(true)
    })
  })
})
