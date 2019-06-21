import { config, mount, createLocalVue } from '@vue/test-utils'
import ContributionForm from './index.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

config.stubs['no-ssr'] = '<span><slot /></span>'

describe('ContributionForm.vue', () => {
  let wrapper
  let postTitleInput
  let expectedParams
  let deutschOption
  let cancelBtn
  let mocks
  const postTitle = 'this is a title for a post'
  const postContent = 'this is a post'
  const computed = { locale: () => 'English' }

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              CreatePost: {
                title: postTitle,
                slug: 'this-is-a-title-for-a-post',
                content: postContent,
                contentExcerpt: postContent,
                language: 'en',
              },
            },
          })
          .mockRejectedValue({ message: 'Not Authorised!' }),
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
      $i18n: {
        locale: () => 'en',
      },
      $router: {
        back: jest.fn(),
        push: jest.fn(),
      },
    }
  })

  describe('mount', () => {
    const getters = {
      'editor/placeholder': () => {
        return 'some cool placeholder'
      },
    }
    const store = new Vuex.Store({
      getters,
    })
    const Wrapper = () => {
      return mount(ContributionForm, { mocks, localVue, computed, store })
    }

    beforeEach(() => {
      wrapper = Wrapper()
      wrapper.setData({ form: { languageOptions: [{ label: 'Deutsch', value: 'de' }] } })
    })

    describe('CreatePost', () => {
      describe('invalid form submission', () => {
        it('title required for form submission', async () => {
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue('this is a title for a post')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('content required for form submission', async () => {
          wrapper.vm.updateEditorContent('this is a post')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })
      })

      describe('valid form submission', () => {
        const imageUpload = {
          file: { filename: 'avataar.svg', previewElement: '' },
          url: 'someUrlToImage',
        }
        beforeEach(async () => {
          expectedParams = {
            variables: {
              title: postTitle,
              content: postContent,
              language: 'en',
              id: null,
              imageUpload: null,
            },
          }
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue('this is a title for a post')
          wrapper.vm.updateEditorContent('this is a post')
          await wrapper.find('form').trigger('submit')
        })

        it('with title and content', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
        })

        it("sends a fallback language based on a user's locale", () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports changing the language', async () => {
          expectedParams.variables.language = 'de'
          deutschOption = wrapper.findAll('li').at(0)
          deutschOption.trigger('click')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports adding a teaser image', async () => {
          expectedParams.variables.imageUpload = imageUpload
          wrapper.vm.vsuccess(imageUpload)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it("pushes the user to the post's page", async () => {
          expect(mocks.$router.push).toHaveBeenCalledTimes(1)
        })

        it('shows a success toaster', () => {
          expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
        })
      })

      describe('cancel', () => {
        it('calls $router.back() when cancel button clicked', () => {
          cancelBtn = wrapper.find('.cancel-button')
          cancelBtn.trigger('click')
          expect(mocks.$router.back).toHaveBeenCalledTimes(1)
        })
      })

      describe('handles errors', () => {
        beforeEach(async () => {
          wrapper = Wrapper()
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue('this is a title for a post')
          wrapper.vm.updateEditorContent('this is a post')
          // second submission causes mutation to reject
          await wrapper.find('form').trigger('submit')
        })
        it('shows an error toaster when apollo mutation rejects', async () => {
          await wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          expect(mocks.$toast.error).toHaveBeenCalledWith('Not Authorised!')
        })
      })
    })
  })
})
