import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Methods from '~/mixins/PostMutationHelpers'

const {
  methods: { deletePostCallback }
} = Methods
// console.log(deletePostCallback())

describe('PostMutationHelpers.js', () => {
  let post
  let mocks

  beforeEach(() => {
    post = {
      id: 'p23'
    }
    mocks = {
      $t: jest.fn(),
      $filters: {
        truncate: a => a
      },
      $emit: jest.fn(),
      $router: {
        history: {
          push: jest.fn()
        }
      },
      $toast: {
        success: () => {},
        error: () => {}
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValue()
      }
    }
  })

  describe('given post id', () => {
    describe('delete post in general', () => {
      beforeEach(() => {
        deletePostCallback()
      })

      it('calls delete mutation', () => {
        expect(mocks.$apollo.mutate).toHaveBeenCalled()
      })

      it('displays a success message', () => {
        const calls = mocks.$t.mock.calls
        const expected = [['delete.contribution.success']]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })

      it.todo('displays an error message')
    })

    describe('delete Post from list', () => {
      it('calls delete in list', () => {
        deletePostCallback('list')
        expect(mocks.$emit).toHaveBeenCalled()
      })
    })

    describe('delete Post displayed on post page', () => {
      it('routs to index (main page) on post page', () => {
        deletePostCallback('page')
        expect($router.history.push).toHaveBeenCalled()
      })
    })
  })
})
