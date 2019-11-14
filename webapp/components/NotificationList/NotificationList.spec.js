import { config, shallowMount, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import NotificationList from './NotificationList'
import Notification from '../Notification/Notification'
import Vuex from 'vuex'
import Filters from '~/plugins/vue-filters'
import Styleguide from '@human-connection/styleguide'
import { notifications } from '~/components/utils/Notifications'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)
localVue.filter('truncate', string => string)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'

describe('NotificationList.vue', () => {
  let wrapper
  let mocks
  let stubs
  let store
  let propsData

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        'auth/isModerator': () => false,
        'auth/user': () => {
          return {}
        },
      },
    })
    mocks = {
      $t: jest.fn(),
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    propsData = { notifications }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(NotificationList, {
        propsData,
        mocks,
        store,
        localVue,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders Notification.vue for each notification of the user', () => {
      expect(wrapper.findAll(Notification)).toHaveLength(2)
    })
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(NotificationList, {
        propsData,
        mocks,
        stubs,
        store,
        localVue,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('click on a notification', () => {
      beforeEach(() => {
        wrapper.find('.notification-mention-post').trigger('click')
      })

      it("emits 'markAsRead' with the id of the notification source", () => {
        expect(wrapper.emitted('markAsRead')[0]).toEqual(['post-1'])
      })
    })
  })
})
