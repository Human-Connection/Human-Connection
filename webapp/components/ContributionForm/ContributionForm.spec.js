import { config, mount, createLocalVue } from '@vue/test-utils'
import ContributionForm from './ContributionForm.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import PostMutations from '~/graphql/PostMutations.js'
import CategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'
import Filters from '~/plugins/vue-filters'
import TeaserImage from '~/components/TeaserImage/TeaserImage'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['no-ssr'] = '<span><slot /></span>'

describe('ContributionForm.vue', () => {
  let wrapper
  let postTitleInput
  let expectedParams
  let deutschOption
  let cancelBtn
  let mocks
  let propsData
  const postTitle = 'this is a title for a post'
  const postContent = 'this is a post'
  const imageUpload = {
    file: {
      filename: 'avataar.svg',
      previewElement: '',
    },
    url: 'someUrlToImage',
  }
  const image = '/uploads/1562010976466-avataaars'
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
          .mockRejectedValue({
            message: 'Not Authorised!',
          }),
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
    propsData = {}
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
      return mount(ContributionForm, {
        mocks,
        localVue,
        store,
        propsData,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
      wrapper.setData({
        form: {
          languageOptions: [
            {
              label: 'Deutsch',
              value: 'de',
            },
          ],
        },
      })
    })

    describe('CreatePost', () => {
      describe('language placeholder', () => {
        it("displays the name that corresponds with the user's location code", () => {
          expect(wrapper.find('.ds-select-placeholder').text()).toEqual('English')
        })
      })

      describe('invalid form submission', () => {
        it('title required for form submission', async () => {
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue(postTitle)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('content required for form submission', async () => {
          wrapper.vm.updateEditorContent(postContent)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })
      })

      describe('valid form submission', () => {
        beforeEach(async () => {
          expectedParams = {
            mutation: PostMutations().CreatePost,
            variables: {
              title: postTitle,
              content: postContent,
              language: 'en',
              id: null,
              categoryIds: null,
              imageUpload: null,
              image: null,
            },
          }
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue(postTitle)
          wrapper.vm.updateEditorContent(postContent)
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

        it('supports adding categories', async () => {
          const categoryIds = ['cat12', 'cat15', 'cat37']
          expectedParams.variables.categoryIds = categoryIds
          wrapper.find(CategoriesSelect).vm.$emit('updateCategories', categoryIds)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports adding a teaser image', async () => {
          expectedParams.variables.imageUpload = imageUpload
          wrapper.find(TeaserImage).vm.$emit('addTeaserImage', imageUpload)
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
          jest.useFakeTimers()
          wrapper = Wrapper()
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue(postTitle)
          wrapper.vm.updateEditorContent(postContent)
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

    describe('UpdatePost', () => {
      beforeEach(() => {
        propsData = {
          contribution: {
            id: 'p1456',
            slug: 'dies-ist-ein-post',
            title: 'dies ist ein Post',
            content: 'auf Deutsch geschrieben',
            language: 'de',
            image,
            categories: [
              {
                id: 'cat12',
                name: 'Democracy & Politics',
              },
            ],
          },
        }
        wrapper = Wrapper()
      })

      it('sets id equal to contribution id', () => {
        expect(wrapper.vm.id).toEqual(propsData.contribution.id)
      })

      it('sets slug equal to contribution slug', () => {
        expect(wrapper.vm.slug).toEqual(propsData.contribution.slug)
      })

      it('sets title equal to contribution title', () => {
        expect(wrapper.vm.form.title).toEqual(propsData.contribution.title)
      })

      it('sets content equal to contribution content', () => {
        expect(wrapper.vm.form.content).toEqual(propsData.contribution.content)
      })

      it('calls the UpdatePost apollo mutation', async () => {
        expectedParams = {
          mutation: PostMutations().UpdatePost,
          variables: {
            title: postTitle,
            content: postContent,
            language: propsData.contribution.language,
            id: propsData.contribution.id,
            categoryIds: ['cat12'],
            image,
            imageUpload: null,
          },
        }
        postTitleInput = wrapper.find('.ds-input')
        postTitleInput.setValue(postTitle)
        wrapper.vm.updateEditorContent(postContent)
        await wrapper.find('form').trigger('submit')
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
      })

      it('supports updating categories', async () => {
        const categoryIds = ['cat3', 'cat51', 'cat37']
        postTitleInput = wrapper.find('.ds-input')
        postTitleInput.setValue(postTitle)
        wrapper.vm.updateEditorContent(postContent)
        expectedParams.variables.categoryIds = categoryIds
        wrapper.find(CategoriesSelect).vm.$emit('updateCategories', categoryIds)
        await wrapper.find('form').trigger('submit')
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
      })
    })
  })
})
