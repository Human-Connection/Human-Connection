import { config, mount, createLocalVue } from '@vue/test-utils'
import ContributionForm from './ContributionForm.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import PostMutations from '~/graphql/PostMutations.js'
import CategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'
import Filters from '~/plugins/vue-filters'
import TeaserImage from '~/components/TeaserImage/TeaserImage'
import MutationObserver from 'mutation-observer'

global.MutationObserver = MutationObserver

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'

const categories = [
  {
    id: 'cat3',
    slug: 'health-wellbeing',
    icon: 'medkit',
  },
  {
    id: 'cat12',
    slug: 'it-internet-data-privacy',
    icon: 'mouse-pointer',
  },
  {
    id: 'cat9',
    slug: 'democracy-politics',
    icon: 'university',
  },
  {
    id: 'cat15',
    slug: 'consumption-sustainability',
    icon: 'shopping-cart',
  },
  {
    id: 'cat4',
    slug: 'environment-nature',
    icon: 'tree',
  },
]

describe('ContributionForm.vue', () => {
  let wrapper,
    postTitleInput,
    expectedParams,
    cancelBtn,
    mocks,
    propsData,
    categoryIds,
    englishLanguage,
    deutschLanguage,
    dataPrivacyButton
  const postTitle = 'this is a title for a post'
  const postTitleTooShort = 'xx'
  let postTitleTooLong = ''
  for (let i = 0; i < 101; i++) {
    postTitleTooLong += 'x'
  }
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
        mutate: jest.fn().mockResolvedValueOnce({
          data: {
            CreatePost: {
              title: postTitle,
              slug: 'this-is-a-title-for-a-post',
              content: postContent,
              contentExcerpt: postContent,
              language: 'en',
              categoryIds,
            },
          },
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
      'auth/isModerator': () => false,
      'auth/user': () => {
        return {
          id: '4711',
          name: 'You yourself',
          slug: 'you-yourself',
        }
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
    })

    describe('CreatePost', () => {
      describe('invalid form submission', () => {
        beforeEach(async () => {
          wrapper.find(CategoriesSelect).setData({ categories })
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue(postTitle)
          await wrapper.vm.updateEditorContent(postContent)
          englishLanguage = wrapper.findAll('li').filter(language => language.text() === 'English')
          englishLanguage.trigger('click')
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
        })

        it('title should not be empty', async () => {
          postTitleInput.setValue('')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('title should not be too long', async () => {
          postTitleInput.setValue(postTitleTooLong)
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('title should not be too short', async () => {
          postTitleInput.setValue(postTitleTooShort)
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('content should not be empty', async () => {
          await wrapper.vm.updateEditorContent('')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('should have at least one category', async () => {
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('should have not have more than three categories', async () => {
          wrapper.vm.form.categoryIds = ['cat4', 'cat9', 'cat15', 'cat27']
          wrapper.find('form').trigger('submit')
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
              categoryIds: ['cat12'],
              imageUpload: null,
              image: null,
            },
          }
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue(postTitle)
          await wrapper.vm.updateEditorContent(postContent)
          wrapper.find(CategoriesSelect).setData({ categories })
          englishLanguage = wrapper.findAll('li').filter(language => language.text() === 'English')
          englishLanguage.trigger('click')
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
        })

        it('creates a post with valid title, content, and at least one category', async () => {
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports changing the language', async () => {
          expectedParams.variables.language = 'de'
          deutschLanguage = wrapper.findAll('li').filter(language => language.text() === 'Deutsch')
          deutschLanguage.trigger('click')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports adding a teaser image', async () => {
          expectedParams.variables.imageUpload = imageUpload
          wrapper.find(TeaserImage).vm.$emit('addTeaserImage', imageUpload)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('content is valid with just a link', async () => {
          await wrapper.vm.updateEditorContent(
            '<a href="https://www.youtube.com/watch?v=smoEelV6FUk" target="_blank"></a>',
          )
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
        })

        it("pushes the user to the post's page", async () => {
          wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          expect(mocks.$router.push).toHaveBeenCalledTimes(1)
        })

        it('shows a success toaster', async () => {
          wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
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
          mocks.$apollo.mutate = jest.fn().mockRejectedValueOnce({
            message: 'Not Authorised!',
          })
          wrapper = Wrapper()
          postTitleInput = wrapper.find('.ds-input')
          postTitleInput.setValue(postTitle)
          await wrapper.vm.updateEditorContent(postContent)
          categoryIds = ['cat12']
          wrapper.find(CategoriesSelect).setData({ categories })
          englishLanguage = wrapper.findAll('li').filter(language => language.text() === 'English')
          englishLanguage.trigger('click')
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
        })

        it('shows an error toaster when apollo mutation rejects', async () => {
          await wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          await expect(mocks.$toast.error).toHaveBeenCalledWith('Not Authorised!')
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

      describe('valid update', () => {
        beforeEach(() => {
          mocks.$apollo.mutate = jest.fn().mockResolvedValueOnce({
            data: {
              UpdatePost: {
                title: postTitle,
                slug: 'this-is-a-title-for-a-post',
                content: postContent,
                contentExcerpt: postContent,
                language: 'en',
                categoryIds,
              },
            },
          })
          wrapper = Wrapper()
          expectedParams = {
            mutation: PostMutations().UpdatePost,
            variables: {
              title: propsData.contribution.title,
              content: propsData.contribution.content,
              language: propsData.contribution.language,
              id: propsData.contribution.id,
              categoryIds: ['cat12'],
              image,
              imageUpload: null,
            },
          }
        })

        it('calls the UpdatePost apollo mutation', async () => {
          expectedParams.variables.content = postContent
          wrapper.vm.updateEditorContent(postContent)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports updating categories', async () => {
          expectedParams.variables.categoryIds.push('cat3')
          wrapper.find(CategoriesSelect).setData({ categories })
          const healthWellbeingButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat3"]')
          healthWellbeingButton.trigger('click')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })
      })
    })
  })
})
