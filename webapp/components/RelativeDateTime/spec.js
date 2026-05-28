import { shallowMount } from '@vue/test-utils'
import RelativeDateTime from './'

const localVue = global.localVue

describe('RelativeDateTime', () => {
  let mocks
  let locale
  let dateTime

  beforeEach(() => {
    mocks = {
      $i18n: {
        locale: () => locale,
      },
    }
  })

  const Wrapper = () => {
    return shallowMount(RelativeDateTime, {
      mocks,
      localVue,
      propsData: {
        dateTime,
      },
    })
  }

  describe('given a String as dateTime', () => {
    beforeEach(() => {
      dateTime = '08.03.2017'
    })

    it('translates', () => {
      expect(Wrapper().text()).toContain('08/03/2017')
    })

    it('keeps the time visible for old dates', () => {
      expect(Wrapper().text()).toContain('12:00 AM')
    })
  })

  describe('given a Date object as dateTime', () => {
    beforeEach(() => {
      dateTime = new Date()
    })

    it('renders', () => {
      expect(Wrapper().is('time')).toBe(true)
    })

    describe("locale == 'en'", () => {
      beforeEach(() => {
        locale = 'en'
      })

      it('translates', () => {
        expect(Wrapper().text()).toContain('today at')
      })
    })

    describe("locale == 'gibberish'", () => {
      beforeEach(() => {
        locale = 'gibberish'
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

  describe('given a Date object older than the relative date window', () => {
    beforeEach(() => {
      locale = 'en'
      dateTime = new Date(2017, 2, 8, 17, 45)
    })

    it('renders the absolute date with time', () => {
      expect(Wrapper().text()).toContain('03/08/2017')
      expect(Wrapper().text()).toContain('5:45 PM')
    })

    it('sets the absolute date with time as title', () => {
      expect(Wrapper().attributes('title')).toBe('03/08/2017, 5:45 PM')
    })

    it('sets a machine-readable datetime attribute', () => {
      expect(Wrapper().attributes('datetime')).toBe(dateTime.toISOString())
    })
  })
})
