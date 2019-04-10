import { shallowMount, createLocalVue } from '@vue/test-utils'
import RelativeDateTime from './index.vue'

const localVue = createLocalVue()

describe('RelativeDateTime', () => {
  let wrapper
  let mocks
  let locale

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
        dateTime: new Date()
      }
    })
  }

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
