import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import ReportsTable from './ReportsTable.vue'
import { reports } from '~/components/features/ReportList/ReportList.story.js'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('ReportsTable', () => {
  let propsData, mocks, getters, wrapper, reportsTable

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn((string) => string),
    }
    getters = {
      'auth/user': () => {
        return { slug: 'awesome-user' }
      },
      'auth/isModerator': () => true,
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(ReportsTable, { propsData, mocks, localVue, store })
    }

    describe('given no reports', () => {
      beforeEach(() => {
        propsData = { ...propsData, reports: [] }
        wrapper = Wrapper()
      })

      it('shows a placeholder', () => {
        expect(wrapper.text()).toContain('moderation.reports.empty')
      })
    })

    describe('given reports', () => {
      beforeEach(() => {
        propsData = { ...propsData, reports }
        wrapper = Wrapper()
        reportsTable = wrapper.find('.ds-table')
      })

      it('renders a table', () => {
        expect(reportsTable.exists()).toBe(true)
      })

      it('renders at least one ReportRow component', () => {
        expect(wrapper.find('.report-row').exists()).toBe(true)
      })
    })
  })
})
