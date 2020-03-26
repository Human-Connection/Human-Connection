import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import EmotionsFilter from './EmotionsFilter'

const localVue = global.localVue

let wrapper, happyEmotionButton

describe('EmotionsFilter', () => {
  const mutations = {
    'posts/TOGGLE_EMOTION': jest.fn(),
    'posts/RESET_EMOTIONS': jest.fn(),
  }
  const getters = {
    'posts/filteredByEmotions': jest.fn(() => []),
  }

  const mocks = {
    $t: jest.fn((string) => string),
  }

  const Wrapper = () => {
    const store = new Vuex.Store({ mutations, getters })
    return mount(EmotionsFilter, { mocks, localVue, store })
  }

  beforeEach(() => {
    wrapper = Wrapper()
  })

  describe('mount', () => {
    it('starts with all emotions button active', () => {
      const allEmotionsButton = wrapper.find('.emotions-filter .sidebar .base-button')
      expect(allEmotionsButton.attributes().class).toContain('--filled')
    })

    describe('click on an "emotion-button" button', () => {
      it('calls TOGGLE_EMOTION when clicked', () => {
        const wrapper = Wrapper()
        happyEmotionButton = wrapper.findAll('.emotion-button > .base-button').at(1)
        happyEmotionButton.trigger('click')
        expect(mutations['posts/TOGGLE_EMOTION']).toHaveBeenCalledWith({}, 'happy')
      })

      it('sets the attribute `src` to colorized image', () => {
        getters['posts/filteredByEmotions'] = jest.fn(() => ['happy'])
        const wrapper = Wrapper()
        happyEmotionButton = wrapper.findAll('.emotion-button > .base-button').at(1)
        const happyEmotionButtonImage = happyEmotionButton.find('img')
        expect(happyEmotionButtonImage.attributes().src).toEqual('/img/svg/emoji/happy_color.svg')
      })
    })

    describe('clears filter', () => {
      it('when all button is clicked', async () => {
        getters['posts/filteredByEmotions'] = jest.fn(() => ['happy'])
        wrapper = await Wrapper()
        const allEmotionsButton = wrapper.find('.emotions-filter .sidebar .base-button')
        allEmotionsButton.trigger('click')
        expect(mutations['posts/RESET_EMOTIONS']).toHaveBeenCalledTimes(1)
      })
    })
  })
})
