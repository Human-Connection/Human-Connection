import { shallowMount } from '@vue/test-utils'
import Ribbon from './index'

const localVue = global.localVue

describe('Ribbon', () => {
  let text

  const Wrapper = () => {
    return shallowMount(Ribbon, {
      localVue,
      propsData: {
        text,
      },
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
