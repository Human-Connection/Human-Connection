import { shallowMount } from '@vue/test-utils'

import Category from './index'

const localVue = global.localVue

describe('Category', () => {
  let icon
  let name

  let Wrapper = () => {
    return shallowMount(Category, {
      localVue,
      propsData: {
        icon,
        name,
      },
    })
  }

  describe('given Strings for Icon and Name', () => {
    beforeEach(() => {
      icon = 'mouse-cursor'
      name = 'Peter'
    })

    it('shows Name', () => {
      expect(Wrapper().text()).toContain('Peter')
    })
    it('shows Icon Svg', () => {
      expect(Wrapper().contains('svg'))
    })
  })
})
