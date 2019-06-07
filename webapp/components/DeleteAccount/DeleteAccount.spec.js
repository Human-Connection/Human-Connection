import { config, mount, createLocalVue } from '@vue/test-utils'
import DeleteAccount from './DeleteAccount.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
config.stubs['b-switch'] = '<span><slot /></span>'
config.stubs['b-checkbox'] = '<span><slot /></span>'

describe('DeleteAccount.vue', () => {
  let mocks
  let wrapper
  let getters
  let actions
  let deleteAccountBtn

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              DeleteAccount: {
                id: 'u343',
              },
            },
          })
          .mockRejectedValue({ message: 'Not authorised!' }),
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
      $router: {
        history: {
          push: jest.fn(),
        },
      },
    }
    getters = {
      'auth/user': () => {
        return { id: 'u343' }
      },
    }
    actions = { 'auth/logout': jest.fn() }
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
        actions,
      })
      return mount(DeleteAccount, { mocks, localVue, store })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('defaults to deleteContributions to false', () => {
      expect(wrapper.vm.deleteContributions).toEqual(false)
    })

    it('defaults to deleteComments to false', () => {
      expect(wrapper.vm.deleteComments).toEqual(false)
    })

    it('defaults to deleteEnabled to false', () => {
      expect(wrapper.vm.deleteEnabled).toEqual(false)
    })

    it('does not call the delete user mutation if deleteEnabled is false', () => {
      deleteAccountBtn = wrapper.find('.ds-button-danger')
      deleteAccountBtn.trigger('click')
      expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
    })

    describe('calls the delete user mutation', () => {
      beforeEach(() => {
        wrapper.setData({ deleteEnabled: true })
        deleteAccountBtn = wrapper.find('.ds-button-danger')
      })

      it('if deleteEnabled is true and only deletes user by default', () => {
        deleteAccountBtn.trigger('click')
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: {
              id: 'u343',
              resource: [],
            },
          }),
        )
      })

      it("deletes a user's posts if requested", () => {
        wrapper.setData({ deleteContributions: true })
        deleteAccountBtn.trigger('click')
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: {
              id: 'u343',
              resource: ['Post'],
            },
          }),
        )
      })

      it("deletes a user's comments if requested", () => {
        wrapper.setData({ deleteComments: true })
        deleteAccountBtn.trigger('click')
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: {
              id: 'u343',
              resource: ['Comment'],
            },
          }),
        )
      })

      it("deletes a user's posts and comments if requested", () => {
        wrapper.setData({ deleteContributions: true, deleteComments: true })
        deleteAccountBtn.trigger('click')
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: {
              id: 'u343',
              resource: ['Post', 'Comment'],
            },
          }),
        )
      })

      it('shows a success toaster after successful mutation', async () => {
        await deleteAccountBtn.trigger('click')
        expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
      })

      it('updates the user in the store', async () => {
        await deleteAccountBtn.trigger('click')
        expect(mocks.$router.history.push).toHaveBeenCalledWith('/')
      })
    })

    describe('error handling', () => {
      it('shows an error toaster when the mutation rejects', async () => {
        wrapper.setData({ deleteEnabled: true })
        deleteAccountBtn = wrapper.find('.ds-button-danger')
        await deleteAccountBtn.trigger('click')
        // second submission causes mutation to reject
        await deleteAccountBtn.trigger('click')
        await mocks.$apollo.mutate
        expect(mocks.$toast.error).toHaveBeenCalledWith('Not authorised!')
      })
    })
  })
})
