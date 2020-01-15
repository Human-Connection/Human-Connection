import { mount } from '@vue/test-utils'
import Emotions from './Emotions.vue'

import Vuex from 'vuex'
import PostMutations from '~/graphql/PostMutations.js'

const localVue = global.localVue

describe('Emotions.vue', () => {
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
                to: { id: 'p143' },
                data: { emotion: 'happy' },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              RemovePostEmotions: {
                from: { id: 'u176' },
                to: { id: 'p143' },
                data: { emotion: 'happy' },
              },
            },
          }),
        query: jest.fn().mockResolvedValue({
          data: {
            PostsEmotionsCountByEmotion: 1,
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
      return mount(Emotions, { mocks, propsData, store, localVue })
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
        wrapper.vm.PostsEmotionsCountByEmotion.funny = 0
        funnyButton = wrapper.findAll('button').at(0)
        funnyButton.trigger('click')
      })

      it('shows the colored image when the button is active', () => {
        funnyImage = wrapper.findAll('img').at(0)
        expect(funnyImage.attributes().src).toEqual(funnyImageSrc)
      })

      it('sends the AddPostEmotionsMutation for an emotion when clicked', () => {
        expectedParams = {
          mutation: PostMutations().AddPostEmotionsMutation,
          variables: { to: { id: 'p143' }, data: { emotion: 'funny' } },
        }
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
      })

      it('increases the PostsEmotionsCountByEmotion for the emotion clicked', () => {
        expect(wrapper.vm.PostsEmotionsCountByEmotion.funny).toEqual(1)
      })

      it('adds an emotion to selectedEmotions to show the colored image when the button is active', () => {
        expect(wrapper.vm.selectedEmotions).toEqual(['funny'])
      })

      describe('removing emotions', () => {
        beforeEach(() => {
          funnyButton.trigger('click')
        })

        it('sends the RemovePostEmotionsMutation when a user clicks on an active emotion', () => {
          expectedParams = {
            mutation: PostMutations().RemovePostEmotionsMutation,
            variables: { to: { id: 'p143' }, data: { emotion: 'funny' } },
          }
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('decreases the PostsEmotionsCountByEmotion for the emotion clicked', async () => {
          expect(wrapper.vm.PostsEmotionsCountByEmotion.funny).toEqual(0)
        })

        it('removes an emotion from selectedEmotions to show the default image', async () => {
          expect(wrapper.vm.selectedEmotions).toEqual([])
        })
      })
    })
  })
})
