import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Notification from '.'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

config.stubs['no-ssr'] = '<span><slot /></span>'

describe('Notification', () => {
  let wrapper
  let stubs
  let propsData
  beforeEach(() => {
    propsData = {}
    stubs = {
      NuxtLink: RouterLinkStub
    }
  })

  const Wrapper = () => {
    return mount(Notification, {
      stubs,
      propsData,
      localVue
    })
  }

  describe('given a notification', () => {
    beforeEach(() => {
      propsData.notification = {
        post: {
          title: "It's a title"
        }
      }
    })

    it('renders title', () => {
      expect(Wrapper().text()).toContain("It's a title")
    })
  })
})
