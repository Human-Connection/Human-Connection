import { shallowMount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Category from './index'

const localVue = createLocalVue()
localVue.use(Styleguide)

describe('Category', () => {
  let icon
  let name

  let Wrapper = () => {
    return shallowMount(Category, {
      localVue,
      propsData: {
        icon,
        name
      }
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
