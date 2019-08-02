import { mount, createLocalVue } from '@vue/test-utils'
import EmotionsButtons from './EmotionsButtons.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import PostMutations from '~/graphql/PostMutations.js'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Vuex)

describe('EmotionsButtons.vue', () => {
  let wrapper
  let mocks
  let propsData
  let getters
  let funnyButton
  let funnyImage
  const funnyImageSrc = '/img/svg/emoji/funny_color.svg'

  beforeEach(() => {
    mocks = {
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              AddPostEmotions: {
                from: { id: 'u176' },
                to: { id: 'p143' },
                data: { emotion: 'happy' },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              RemovePostEmotions: true,
            },
          }),
        query: jest.fn().mockResolvedValue({
          data: {
            postsEmotionsCountByEmotion: 1,
          },
        }),
      },
      $t: jest.fn(),
    }
    propsData = {
      post: { id: 'p143' },
    }
    getters = {
      'auth/user': () => {
        return { id: 'u176' }
      },
    }
  })
  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(EmotionsButtons, { mocks, propsData, store, localVue })
    }
    beforeEach(() => {
      wrapper = Wrapper()
    })

    it("queries the post's emotions count for each of the 5 emotions", () => {
      expect(mocks.$apollo.query).toHaveBeenCalledTimes(5)
    })

    describe('adding emotions', () => {
      let expectedParams
      beforeEach(() => {
        wrapper.vm.postsEmotionsCountByEmotion.funny = 0
        funnyButton = wrapper.findAll('button').at(0)
        funnyButton.trigger('click')
      })

      it('shows the colored image when the button is active', () => {
        funnyImage = wrapper.findAll('img').at(0)
        expect(funnyImage.attributes().src).toEqual(funnyImageSrc)
      })

      it('sends the addPostEmotionsMutation for an emotion when clicked', () => {
        expectedParams = {
          mutation: PostMutations().addPostEmotionsMutation,
          variables: { from: { id: 'u176' }, to: { id: 'p143' }, data: { emotion: 'funny' } },
        }
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
      })

      it('increases the postEmotionsCountByEmotion for the emotion clicked', () => {
        expect(wrapper.vm.postsEmotionsCountByEmotion.funny).toEqual(1)
      })

      it('adds an emotion to selectedEmotions to show the colored image when the button is active', () => {
        expect(wrapper.vm.selectedEmotions).toEqual(['funny'])
      })

      describe('removing emotions', () => {
        beforeEach(() => {
          funnyButton.trigger('click')
        })

        it('sends the removePostEmotionsMutation when a user clicks on an active emotion', () => {
          expectedParams = {
            mutation: PostMutations().removePostEmotionsMutation,
            variables: { from: { id: 'u176' }, to: { id: 'p143' }, data: { emotion: 'funny' } },
          }
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('decreases the postEmotionsCountByEmotion for the emotion clicked', async () => {
          expect(wrapper.vm.postsEmotionsCountByEmotion.funny).toEqual(0)
        })

        it('removes an emotion from selectedEmotions to show the default image', async () => {
          expect(wrapper.vm.selectedEmotions).toEqual([])
        })
      })
    })
  })
})
