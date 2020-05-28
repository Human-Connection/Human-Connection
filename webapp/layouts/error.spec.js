import { config, shallowMount } from '@vue/test-utils'
import Error from './error.vue'

const localVue = global.localVue

config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('error.vue', () => {
  let mocks, wrapper

  beforeEach(() => {
    mocks = {
      $t: jest.fn((key) => key),
    }
  })

  const Wrapper = (propsData = {}) => {
    return shallowMount(Error, { mocks, propsData, localVue })
  }

  describe('shallowMount', () => {
    it('renders default error message', () => {
      wrapper = Wrapper({ error: {} })
      expect(wrapper.find('.error-message').text()).toBe('error-pages.default')
    })

    it('renders error message to given statusCode', () => {
      wrapper = Wrapper({ error: { statusCode: 404 } })
      expect(wrapper.find('.error-message').text()).toBe('error-pages.404-default')
    })

    it('renders error message to given custom key', () => {
      wrapper = Wrapper({ error: { statusCode: 404, key: 'my-custom-key' } })
      expect(wrapper.find('.error-message').text()).toBe('my-custom-key')
    })

    it('has a link to index page', () => {
      wrapper = Wrapper({ error: {} })
      expect(wrapper.find('span[to="/"]').text()).toBe('error-pages.back-to-index')
    })

    it('has an image related to the status code', () => {
      wrapper = Wrapper({ error: { statusCode: 404 } })
      expect(wrapper.find('.error-image').attributes('src')).toBe('/img/svg/errors/error404.svg')
    })
  })
})
