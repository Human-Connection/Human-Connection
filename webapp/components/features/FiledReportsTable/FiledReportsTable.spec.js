import { config, mount, RouterLinkStub } from '@vue/test-utils'
import Vuex from 'vuex'
import FiledReportsTable from './FiledReportsTable'
import { reports } from '~/components/features/ReportList/ReportList.story.js'

const localVue = global.localVue

localVue.filter('truncate', (string) => string)

config.stubs['client-only'] = '<span><slot /></span>'

describe('FiledReportsTable.vue', () => {
  let wrapper, mocks, propsData, stubs, filed

  beforeEach(() => {
    mocks = {
      $t: jest.fn((string) => string),
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    propsData = {}
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters: {
          'auth/isModerator': () => true,
          'auth/user': () => {
            return { id: 'moderator' }
          },
        },
      })
      return mount(FiledReportsTable, {
        propsData,
        mocks,
        localVue,
        store,
        stubs,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('given reports', () => {
      beforeEach(() => {
        filed = reports.map((report) => report.filed)
        propsData.filed = filed[0]
        wrapper = Wrapper()
      })

      it('renders a table', () => {
        expect(wrapper.find('.ds-table').exists()).toBe(true)
      })

      it('has 4 columns', () => {
        expect(wrapper.findAll('.ds-table-col')).toHaveLength(4)
      })

      describe('FiledReport', () => {
        it('renders the reporting user', () => {
          const userSlug = wrapper.find('[data-test="filing-user"]')
          expect(userSlug.text()).toContain('@community-moderator')
        })

        it('renders the reported date', () => {
          const date = wrapper.find('[data-test="filed-date"]')
          expect(date.text()).toEqual('10/02/2019')
        })

        it('renders the category text', () => {
          const columns = wrapper.findAll('.ds-table-col')
          const reasonCategory = columns.filter(
            (category) =>
              category.text() === 'report.reason.category.options.pornographic_content_links',
          )
          expect(reasonCategory.exists()).toBe(true)
        })

        it("renders the Post's content", () => {
          const columns = wrapper.findAll('.ds-table-col')
          const reasonDescription = columns.filter(
            (column) => column.text() === 'This comment is porno!!!',
          )
          expect(reasonDescription.exists()).toBe(true)
        })
      })
    })
  })
})
