import { mount } from '@vue/test-utils'
import CounterIcon from './CounterIcon'
import BaseIcon from '../BaseIcon/BaseIcon'

const localVue = global.localVue

describe('CounterIcon.vue', () => {
  let propsData, wrapper, count

  const Wrapper = () => {
    return mount(CounterIcon, { propsData, localVue })
  }

  describe('given a valid icon name and count below 100', () => {
    beforeEach(() => {
      propsData = { icon: 'comments', count: 42 }
      wrapper = Wrapper()
      count = wrapper.find('.count')
    })

    it('renders the icon', () => {
      expect(wrapper.find(BaseIcon).exists()).toBe(true)
    })

    it('renders the count', () => {
      expect(count.text()).toEqual('42')
    })
  })

  describe('given a valid icon name and count above 100', () => {
    beforeEach(() => {
      propsData = { icon: 'comments', count: 750 }
      wrapper = Wrapper()
      count = wrapper.find('.count')
    })

    it('renders the icon', () => {
      expect(wrapper.find(BaseIcon).exists()).toBe(true)
    })

    it('renders the capped count with a plus', () => {
      expect(count.text()).toEqual('99+')
    })
  })
})
