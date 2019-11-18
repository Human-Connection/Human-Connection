import { mount, createLocalVue } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import DropdownFilter from './DropdownFilter.vue'

const localVue = createLocalVue()
localVue.use(Styleguide)
localVue.use(VTooltip)

describe('DropdownFilter.vue', () => {
  let propsData, wrapper, mocks

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn(a => a),
    }
  })

  const Wrapper = () => {
    return mount(DropdownFilter, { propsData, localVue, mocks })
  }

  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('selected', () => {
      it('displays selected filter', () => {
        propsData.selected = 'Read'
        wrapper = Wrapper()
        expect(wrapper.find('.dropdown-filter label').text()).toEqual(propsData.selected)
      })
    })

    describe('menu items', () => {
      let allLink
      beforeEach(() => {
        propsData.filterOptions = [
          { label: 'All', value: null },
          { label: 'Read', value: true },
          { label: 'Unread', value: false },
        ]
        wrapper = Wrapper()
        wrapper.find('.dropdown-filter').trigger('click')
        allLink = wrapper
          .findAll('.dropdown-menu-item')
          .at(propsData.filterOptions.findIndex(option => option.label === 'All'))
      })

      it('displays a link for All', () => {
        expect(allLink.text()).toEqual('All')
      })

      it('displays a link for Read', () => {
        const readLink = wrapper
          .findAll('.dropdown-menu-item')
          .at(propsData.filterOptions.findIndex(option => option.label === 'Read'))
        expect(readLink.text()).toEqual('Read')
      })

      it('displays a link for Unread', () => {
        const unreadLink = wrapper
          .findAll('.dropdown-menu-item')
          .at(propsData.filterOptions.findIndex(option => option.label === 'Unread'))
        expect(unreadLink.text()).toEqual('Unread')
      })

      it('clicking on menu item emits filterNotifications', () => {
        allLink.trigger('click')
        expect(wrapper.emitted().filterNotifications[0]).toEqual(
          propsData.filterOptions.filter(option => option.label === 'All'),
        )
      })
    })
  })
})
