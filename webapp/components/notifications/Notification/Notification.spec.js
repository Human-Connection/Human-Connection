import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Notification from './Notification'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['client-only'] = '<span><slot /></span>'

describe('Notification', () => {
  let stubs
  let mocks
  let propsData
  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn(),
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
  })

  const Wrapper = () => {
    return mount(Notification, {
      stubs,
      mocks,
      propsData,
      localVue,
    })
  }

  describe('given a notification', () => {
    beforeEach(() => {
      propsData.notification = {
        post: {
          title: "It's a title",
          id: 'post-1',
          slug: 'its-a-title',
          contentExcerpt: '<a href="/profile/u3" target="_blank">@jenny-rostock</a> is the best',
        },
      }
    })

    it('renders title', () => {
      expect(Wrapper().text()).toContain("It's a title")
    })

    it('renders the contentExcerpt', () => {
      expect(Wrapper().text()).toContain('@jenny-rostock is the best')
    })

    it('has no class "read"', () => {
      expect(Wrapper().classes()).not.toContain('read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
      })

      it('has class "read"', () => {
        expect(Wrapper().classes()).toContain('read')
      })
    })
  })
})
