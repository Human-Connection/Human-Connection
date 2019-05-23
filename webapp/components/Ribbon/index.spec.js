import { shallowMount, createLocalVue } from '@vue/test-utils'
import Ribbon from './index'

const localVue = createLocalVue()

describe('Ribbon', () => {
  let text

  let Wrapper = () => {
    return shallowMount(Ribbon, {
      localVue,
      propsData: {
        text
      }
    })
  }

  describe('given String for Text', () => {
    beforeEach(() => {
      text = 'Peter Pan'
    })

    it('shows Text', () => {
      expect(Wrapper().text()).toContain('Peter Pan')
    })
  })

  describe('given no String for Text', () => {
    beforeEach(() => {
      text = undefined
    })

    it('shows empty Text', () => {
      expect(Wrapper().text()).toContain('')
    })
  })
})
