import { mount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import DonationInfo from './DonationInfo.vue'

const localVue = createLocalVue()
localVue.use(Styleguide)

const mockDate = new Date(2019, 11, 6)
global.Date = jest.fn(() => mockDate)

describe('DonationInfo.vue', () => {
  let mocks, propsData
  beforeEach(() => {
    mocks = {
      $t: jest.fn(string => string),
      $i18n: {
        locale: () => 'de',
      },
    }
    propsData = {
      goal: 50000,
      progress: 10000,
    }
  })

  const Wrapper = () => mount(DonationInfo, { propsData, mocks, localVue })

  it('includes a link to the Human Connection donations website', () => {
    expect(
      Wrapper()
        .find('a')
        .attributes('href'),
    ).toBe('https://human-connection.org/spenden/')
  })

  it('displays a call to action button', () => {
    expect(
      Wrapper()
        .find('.ds-button')
        .text(),
    ).toBe('donations.donate-now')
  })

  it('creates a title from the current month and a translation string', () => {
    mocks.$t = jest.fn(() => 'Spenden für')
    expect(Wrapper().vm.title).toBe('Spenden für Dezember')
  })

  describe('given german locale', () => {
    it('creates a label from the given amounts and a translation string', () => {
      Wrapper()
      expect(mocks.$t.mock.calls[1][0]).toBe('donations.amount-of-total')
      expect(mocks.$t.mock.calls[1][1]).toStrictEqual({
        amount: '10.000',
        total: '50.000',
      })
    })
  })

  describe('given english locale', () => {
    it('creates a label from the given amounts and a translation string', () => {
      mocks.$i18n.locale = () => 'en'
      Wrapper()
      expect(mocks.$t.mock.calls[1][0]).toBe('donations.amount-of-total')
      expect(mocks.$t.mock.calls[1][1]).toStrictEqual({
        amount: '10,000',
        total: '50,000',
      })
    })
  })
})
