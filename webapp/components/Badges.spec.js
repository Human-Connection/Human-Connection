import { shallowMount } from '@vue/test-utils'
import Badges from './Badges.vue'

describe('Badges.vue', () => {
  let propsData

  beforeEach(() => {
    propsData = {}
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(Badges, { propsData })
    }

    it('has class "hc-badges"', () => {
      expect(Wrapper().contains('.hc-badges')).toBe(true)
    })

    describe('given a badge', () => {
      beforeEach(() => {
        propsData.badges = [{ id: 'some-icon' }]
      })

      it('generates badge icon url', () => {
        expect(Wrapper().contains('img[src="/img/badges/some-icon.svg"]')).toBe(true)
      })
    })
  })
})
