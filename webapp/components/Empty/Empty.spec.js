import { shallowMount } from '@vue/test-utils'

import Empty from './Empty.vue'

const localVue = global.localVue

describe('Empty.vue', () => {
  let propsData, wrapper

  beforeEach(() => {
    propsData = {}
  })

  const Wrapper = () => {
    return shallowMount(Empty, { propsData, localVue })
  }

  describe('shallowMount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders an image with an alert icon as default', () => {
      expect(wrapper.find('img[alt="Empty"]').attributes().src).toBe('/img/empty/alert.svg')
    })

    describe('receives icon prop', () => {
      it('renders an image with that icon', () => {
        propsData.icon = 'messages'
        wrapper = Wrapper()
        expect(wrapper.find('img[alt="Empty"]').attributes().src).toBe(
          `/img/empty/${propsData.icon}.svg`,
        )
      })
    })

    describe('receives message prop', () => {
      it('renders that message', () => {
        propsData.message = 'this is a custom message for Empty component'
        wrapper = Wrapper()
        expect(wrapper.find('.hc-empty-message').text()).toEqual(propsData.message)
      })
    })

    describe('receives margin prop', () => {
      it('sets margin to that margin', () => {
        propsData.margin = 'xxx-small'
        wrapper = Wrapper()
        expect(wrapper.find('.hc-empty').attributes().margin).toEqual(propsData.margin)
      })
    })
  })
})
