import { mount, createLocalVue } from '@vue/test-utils'
import DeleteData from './DeleteData.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

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
        return { id: 'u343', name: deleteAccountName, contributionsCount: 2, commentsCount: 3 }
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
        enableDeletionInput = wrapper.find('.enable-deletion-input input')
        enableDeletionInput.setValue(deleteAccountName)
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
        mocks.$t.mockImplementation(() => deleteContributionsMessage)
        enableContributionDeletionCheckbox = wrapper.findAll('.checkbox-container input').at(0)
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
        enableCommentDeletionCheckbox = wrapper.findAll('.checkbox-container input').at(1)
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

      it("deletes a user's posts and comments if requested", () => {
        mocks.$t.mockImplementation(() => deleteContributionsMessage)
        enableContributionDeletionCheckbox = wrapper.findAll('.checkbox-container input').at(0)
        enableContributionDeletionCheckbox.trigger('click')
        mocks.$t.mockImplementation(() => deleteCommentsMessage)
        enableCommentDeletionCheckbox = wrapper.findAll('.checkbox-container input').at(1)
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
        enableDeletionInput = wrapper.find('.enable-deletion-input input')
        enableDeletionInput.setValue(deleteAccountName)
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
