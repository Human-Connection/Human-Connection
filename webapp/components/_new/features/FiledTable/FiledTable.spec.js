import { config, mount, RouterLinkStub } from '@vue/test-utils'
import Vuex from 'vuex'
import FiledTable from './FiledTable'

import { reports } from '~/components/_new/features/ReportsTable/ReportsTable.story.js'

const localVue = global.localVue

localVue.filter('truncate', string => string)

config.stubs['client-only'] = '<span><slot /></span>'

describe('FiledTable.vue', () => {
  let wrapper, mocks, propsData, stubs, filed
  const filedReport = reports[0]

  beforeEach(() => {
    mocks = {
      $t: jest.fn(string => string),
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
      return mount(FiledTable, {
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
        filed = reports.map(report => report.filed)
        propsData.filed = filed[0]
        wrapper = Wrapper()
      })

      it('renders a table', () => {
        expect(wrapper.find('.ds-table').exists()).toBe(true)
      })

      describe('renders 4 columns', () => {
        it('for icon', () => {
          expect(wrapper.vm.fields.submitter).toBeTruthy()
        })

        it('for user', () => {
          expect(wrapper.vm.fields.reportedOn).toBeTruthy()
        })

        it('for post', () => {
          expect(wrapper.vm.fields.reasonCategory).toBeTruthy()
        })

        it('for content', () => {
          expect(wrapper.vm.fields.reasonDescription).toBeTruthy()
        })
      })

      describe('Filed', () => {
        it('renders the reporting user', () => {
          const communityModerator = wrapper.find('[data-test="community-moderator"]')
          const username = communityModerator.find('.username')
          expect(username.text()).toEqual('Community moderator')
        })

        it('renders the reported date', () => {
          const dsTexts = wrapper.findAll('.ds-text')
          const date = dsTexts.filter(element => element.text() === 'yesterday at 4:56 PM')
          expect(date.exists()).toBe(true)
        })

        it.only('renders a link to the Post', () => {
          const columns = wrapper.findAll('td')
          const reasonCategory = columns.filter(category =>
            category.text().includes('pornographic material'),
          )
          expect(reasonCategory.exists()).toBe(true)
        })

        it("renders the Post's content", () => {
          const boldTags = secondRowNotification.findAll('b')
          const content = boldTags.filter(
            element => element.text() === commentNotification.from.contentExcerpt,
          )
          expect(content.exists()).toBe(true)
        })
      })
    })
  })
})
