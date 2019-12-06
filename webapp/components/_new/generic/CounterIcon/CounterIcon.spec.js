import { mount } from '@vue/test-utils'
import CounterIcon from './CounterIcon'
import BaseIcon from '../BaseIcon/BaseIcon'

const localVue = global.localVue

describe('CounterIcon.vue', () => {
  let propsData, wrapper, tag

  const Wrapper = () => {
    return mount(CounterIcon, { propsData, localVue })
  }

  describe('given a valid icon name and count', () => {
    beforeEach(() => {
      propsData = { icon: 'comments', count: 1 }
      wrapper = Wrapper()
      tag = wrapper.find('.ds-tag')
    })

    it('renders BaseIcon', () => {
      expect(wrapper.find(BaseIcon).exists()).toBe(true)
    })

    it('renders the count', () => {
      expect(tag.text()).toEqual('1')
    })

    it('uses a round tag', () => {
      expect(tag.classes()).toContain('ds-tag-round')
    })

    it('uses a primary button', () => {
      expect(tag.classes()).toContain('ds-tag-primary')
    })
  })
})
