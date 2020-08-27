import { mount } from '@vue/test-utils'
import DeleteData from './DeleteData.vue'
import Vue from 'vue'
import Vuex from 'vuex'

const localVue = global.localVue

describe('DeleteData.vue', () => {
  let mocks
  let wrapper
  let getters
  let actions
  let deleteAccountBtn
  let enableDeletionInput
  let enableContributionDeletionCheckbox
  let enableCommentDeletionCheckbox
  const deleteAccountName = 'Delete MyAccount'

  beforeEach(() => {
    mocks = {
      $t: jest.fn((a) => a),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              DeleteData: {
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
        return { id: 'u343', name: deleteAccountName }
      },
    }
    actions = { 'auth/logout': jest.fn() }
  })

  describe('mount', () => {
    const data = () => {
      return {
        currentUserCounts: {
          contributionsCount: 4,
          commentedCount: 2,
        },
      }
    }
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
        actions,
      })
      return mount(DeleteData, { mocks, localVue, store, data })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('checkbox deleteContributions defaults be false', () => {
      expect(wrapper.vm.deleteContributions).toEqual(false)
    })

    it('checkbox deleteComments defaults be false', () => {
      expect(wrapper.vm.deleteComments).toEqual(false)
    })

    it('deleteButton defaults be false', () => {
      expect(wrapper.vm.deleteEnabled).toEqual(false)
    })

    it('does not call the delete user mutation if deleteEnabled is false', () => {
      deleteAccountBtn = wrapper.find('[data-test="delete-button"]')
      deleteAccountBtn.trigger('click')
      expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
    })

    describe('calls the delete user mutation', () => {
      beforeEach(() => {
        enableDeletionInput = wrapper.find('.ds-input')
        enableDeletionInput.setValue(deleteAccountName)
        deleteAccountBtn = wrapper.find('[data-test="delete-button"]')
      })

      it('if deleteEnabled is true and only deletes user ', () => {
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

      it("deletes user's posts and comments if requested by default ", () => {
        enableContributionDeletionCheckbox = wrapper.find(
          '[data-test="contributions-deletion-checkbox"]',
        )
        enableContributionDeletionCheckbox.trigger('click')
        enableCommentDeletionCheckbox = wrapper.find('[data-test="comments-deletion-checkbox"]')
        enableCommentDeletionCheckbox.trigger('click')
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

      it("deletes a user's posts if requested", () => {
        enableContributionDeletionCheckbox = wrapper.find(
          '[data-test="contributions-deletion-checkbox"]',
        )
        enableContributionDeletionCheckbox.trigger('click')
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
        enableCommentDeletionCheckbox = wrapper.find('[data-test="comments-deletion-checkbox"]')
        enableCommentDeletionCheckbox.trigger('click')
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

      it('shows a success toaster after successful mutation', async () => {
        await deleteAccountBtn.trigger('click')
        expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
      })

      it('redirect the user to the homepage', async () => {
        await deleteAccountBtn.trigger('click')
        expect(mocks.$router.history.push).toHaveBeenCalledWith('/')
      })
    })

    describe('error handling', () => {
      it('shows an error toaster when the mutation rejects', async () => {
        enableDeletionInput = wrapper.find('.ds-input')
        enableDeletionInput.setValue(deleteAccountName)
        await Vue.nextTick()
        deleteAccountBtn = wrapper.find('[data-test="delete-button"]')
        await deleteAccountBtn.trigger('click')
        // second submission causes mutation to reject
        await deleteAccountBtn.trigger('click')
        await mocks.$apollo.mutate
        expect(mocks.$toast.error).toHaveBeenCalledWith('Not authorised!')
      })
    })
  })
})
