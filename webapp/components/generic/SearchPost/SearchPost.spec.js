import { mount } from '@vue/test-utils'
import SearchPost from './SearchPost.vue'

const localVue = global.localVue
localVue.filter('dateTime', (d) => d)

describe('SearchPost.vue', () => {
  let mocks, wrapper, propsData, counts
  beforeEach(() => {
    mocks = {
      $t: jest.fn((string) => string),
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
    counts = wrapper.find('.search-post > .metadata > .counts')
  })

  const Wrapper = () => {
    return mount(SearchPost, { mocks, localVue, propsData })
  }

  describe('shallowMount', () => {
    it('renders post title', () => {
      expect(wrapper.find('.search-post > .label').text()).toMatch('Post Title')
    })

    it('renders post commentsCount', () => {
      expect(counts.text()).toContain(propsData.option.commentsCount)
    })

    it('renders post shoutedCount', () => {
      expect(counts.text()).toContain(propsData.option.shoutedCount)
    })

    it('renders post author', () => {
      expect(wrapper.find('.search-post > .metadata').text()).toContain('Post Author')
    })

    it('renders post createdAt', () => {
      expect(wrapper.find('.search-post > .metadata').text()).toContain('23.08.2019')
    })
  })
})
