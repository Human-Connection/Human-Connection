import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Notification from '.'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['no-ssr'] = '<span><slot /></span>'

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
        },
      }
    })

    it('renders title', () => {
      expect(Wrapper().text()).toContain("It's a title")
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
