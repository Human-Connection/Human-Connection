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

    it('renders the full date and time for older dates', () => {
      expect(Wrapper().text()).toContain('08/03/2017')
      expect(Wrapper().text()).toContain('12:00 AM')
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

      describe('and dateTime is older than a week', () => {
        beforeEach(() => {
          dateTime = new Date(2017, 7, 3, 12, 34)
        })

        it('renders the full date and time', () => {
          expect(Wrapper().text()).toContain('08/03/2017')
          expect(Wrapper().text()).toContain('12:34 PM')
        })

        it('adds the full date and time as title', () => {
          expect(Wrapper().attributes('title')).toEqual('08/03/2017, 12:34 PM')
        })
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
})
