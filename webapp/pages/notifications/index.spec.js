import { config, shallowMount, mount } from '@vue/test-utils'
import NotificationsPage from './index.vue'

import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import NotificationsTable from '~/components/NotificationsTable/NotificationsTable'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'

describe('PostIndex', () => {
  let wrapper, Wrapper, mocks, propsData

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: (string) => string,
      $toast: {
        error: jest.fn((string) => string),
      },
      $i18n: {
        locale: () => 'en',
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValueOnce({
          data: { markAsRead: { id: 'notificationSourceId', read: true } },
        }),
        queries: {
          notifications: {
            refresh: jest.fn().mockResolvedValueOnce(),
          },
        },
      },
    }
  })

  describe('shallowMount', () => {
    beforeEach(() => {
      Wrapper = () => {
        return shallowMount(NotificationsPage, {
          mocks,
          localVue,
          propsData,
        })
      }
      wrapper = Wrapper()
    })

    it('renders a Notications header', () => {
      expect(wrapper.find('ds-heading-stub').exists()).toBe(true)
    })

    it('renders a `dropdown-filter` component', () => {
      expect(wrapper.find('dropdown-filter-stub').exists()).toBe(true)
    })

    it('renders a `notifications-table` component', () => {
      expect(wrapper.find('notifications-table-stub').exists()).toBe(true)
    })
  })

  describe('mount', () => {
    beforeEach(() => {
      Wrapper = () => {
        return mount(NotificationsPage, {
          mocks,
          localVue,
          propsData,
        })
      }
    })

    describe('filter', () => {
      beforeEach(() => {
        propsData.filterOptions = [
          { label: 'All', value: null },
          { label: 'Read', value: true },
          { label: 'Unread', value: false },
        ]
        wrapper = Wrapper()
        wrapper.find(DropdownFilter).vm.$emit('filter', propsData.filterOptions[1])
      })

      it('sets `notificationRead` to value of received option', () => {
        expect(wrapper.vm.notificationRead).toEqual(propsData.filterOptions[1].value)
      })

      it('set label to the label of the received option', () => {
        expect(wrapper.vm.selected).toEqual(propsData.filterOptions[1].label)
      })

      it('refreshes the notifications', () => {
        expect(mocks.$apollo.queries.notifications.refresh).toHaveBeenCalledTimes(1)
      })
    })

    describe('markNotificationAsRead', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        wrapper.find(NotificationsTable).vm.$emit('markNotificationAsRead', 'notificationSourceId')
      })

      it('calls markNotificationAsRead mutation', () => {
        expect(mocks.$apollo.mutate).toHaveBeenCalledWith(
          expect.objectContaining({ variables: { id: 'notificationSourceId' } }),
        )
      })

      describe('error handling', () => {
        beforeEach(() => {
          mocks.$apollo.mutate = jest.fn().mockRejectedValueOnce({ message: 'Some error message' })
          wrapper = Wrapper()
          wrapper
            .find(NotificationsTable)
            .vm.$emit('markNotificationAsRead', 'notificationSourceId')
        })

        it('shows an error message if there is an error', () => {
          expect(mocks.$toast.error).toHaveBeenCalledWith('Some error message')
        })
      })
    })

    describe('PaginationButtons', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      describe('next: given a user is on the first page', () => {
        it('adds offset to pageSize to skip first x notifications and display next page', () => {
          wrapper.find(PaginationButtons).vm.$emit('next')
          expect(wrapper.vm.offset).toEqual(12)
        })
      })

      describe('back: given a user is on the third page', () => {
        it('sets offset when back is emitted', () => {
          wrapper.setData({ offset: 24 })
          wrapper.find(PaginationButtons).vm.$emit('back')
          expect(wrapper.vm.offset).toEqual(12)
        })
      })
    })
  })
})
