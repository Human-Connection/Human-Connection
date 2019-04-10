import { shallowMount, createLocalVue } from '@vue/test-utils'
import RelativeDateTime from './RelativeDateTime.vue'

const localVue = createLocalVue()

describe('RelativeDateTime', () => {
  let wrapper
  let mocks
  let locale
  let dateTime

  beforeEach(() => {
    mocks = {
      $i18n: {
        locale: () => locale
      }
    }
  })

  let Wrapper = () => {
    return shallowMount(RelativeDateTime, {
      mocks,
      localVue,
      propsData: {
        dateTime
      }
    })
  }

  describe('given a String as dateTime', () => {
    beforeEach(() => {
      dateTime = '08.03.2017'
    })

    it('translates', () => {
      expect(Wrapper().text()).toContain('08/03/2017')
    })
  })

  describe('given a Date object as dateTime', () => {
    beforeEach(() => {
      dateTime = new Date()
    })

    it('renders', () => {
      expect(Wrapper().is('span')).toBe(true)
    })

    describe("locale == 'en'", () => {
      beforeEach(() => {
        locale = 'en'
      })

      it('translates', () => {
        expect(Wrapper().text()).toContain('today at')
      })
    })

    describe("locale == 'de'", () => {
      beforeEach(() => {
        locale = 'de'
      })

      it('translates', () => {
        expect(Wrapper().text()).toContain('heute um')
      })
    })
  })
})
