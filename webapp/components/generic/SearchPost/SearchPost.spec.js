import { shallowMount } from '@vue/test-utils'
import SearchPost from './SearchPost.vue'

const localVue = global.localVue
localVue.filter('dateTime', d => d)

describe('SearchPost.vue', () => {
  let mocks, wrapper, propsData
  beforeEach(() => {
    mocks = {
      $t: jest.fn(string => string),
    }
    propsData = {
      option: {
        title: 'Post Title',
        commentsCount: 3,
        shoutedCount: 6,
        createdAt: '23.08.2019',
        author: {
          name: 'Post Author',
        },
      },
    }
    wrapper = Wrapper()
  })

  const Wrapper = () => {
    return shallowMount(SearchPost, { mocks, localVue, propsData })
  }

  describe('shallowMount', () => {
    it('renders post title', () => {
      expect(wrapper.find('.search-option-label').text()).toMatch('Post Title')
    })

    it('renders post commentsCount', () => {
      expect(
        wrapper
          .find('.search-post-meta')
          .findAll('span')
          .filter(item => item.text() === '3')
          .exists(),
      ).toBe(true)
    })

    it('renders post shoutedCount', () => {
      expect(
        wrapper
          .find('.search-post-meta')
          .findAll('span')
          .filter(item => item.text() === '6')
          .exists(),
      ).toBe(true)
    })

    it('renders post author', () => {
      expect(wrapper.find('.search-post-author').text()).toContain('Post Author')
    })

    it('renders post createdAt', () => {
      expect(wrapper.find('.search-post-author').text()).toContain('23.08.2019')
    })
  })
})
