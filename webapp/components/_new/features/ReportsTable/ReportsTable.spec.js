import { config, mount } from '@vue/test-utils'
import ReportsTable from './ReportsTable.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = global.localVue
localVue.use(Styleguide)

config.stubs['client-only'] = '<span><slot /></span>'

describe('ReportsTable', () => {
  let propsData
  let mocks
  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn(t => t),
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(ReportsTable, { propsData, mocks, localVue })
    }

    describe('no reports', () => {
      beforeEach(() => {
        propsData = { ...propsData, reports: [] }
      })

      it('shows a placeholder', () => {
        const wrapper = Wrapper()
        expect(wrapper.text()).toContain('moderation.reports.empty')
      })
    })
  })
})
