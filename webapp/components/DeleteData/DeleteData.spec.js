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
  const deleteContributionsMessage = 'Delete my 2 posts'
  const deleteCommentsMessage = 'Delete my 3 comments'

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
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
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
        actions,
      })
      return mount(DeleteData, { mocks, localVue, store })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('defaults to deleteContributions to true', () => {
      expect(wrapper.vm.deleteContributions).toEqual(false)
    })

    it('defaults to deleteComments to true', () => {
      expect(wrapper.vm.deleteComments).toEqual(false)
    })

    it('defaults to deleteEnabled to false', () => {
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
        mocks.$t.mockImplementation(() => deleteContributionsMessage)
        enableContributionDeletionCheckbox = wrapper.findAll('input[type="checkbox"]').at(0)
        mocks.$t.mockImplementation(() => deleteCommentsMessage)
        enableCommentDeletionCheckbox = wrapper.findAll('input[type="checkbox"]').at(1)
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
        mocks.$t.mockImplementation(() => deleteContributionsMessage)
        enableContributionDeletionCheckbox = wrapper.findAll('input[type="checkbox"]').at(0)
        enableContributionDeletionCheckbox.trigger('click')
        mocks.$t.mockImplementation(() => deleteCommentsMessage)
        enableCommentDeletionCheckbox = wrapper.findAll('input[type="checkbox"]').at(1)
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
        mocks.$t.mockImplementation(() => deleteContributionsMessage)
        enableContributionDeletionCheckbox = wrapper.findAll('input[type="checkbox"]').at(0)
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
        mocks.$t.mockImplementation(() => deleteCommentsMessage)
        enableCommentDeletionCheckbox = wrapper.findAll('input[type="checkbox"]').at(1)
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
