import { shallowMount, createLocalVue } from '@vue/test-utils'
import RelativeDateTime from './index.vue'

import Filters from '../../plugins/vue-filters.js'
const localVue = createLocalVue()
localVue.use(Filters)

describe('RelativeDateTime', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(RelativeDateTime, {
      localVue,
      propsData: {
        dateTime: new Date()
      }
    })
  })

  it('renders', () => {
    console.log(wrapper.html())
    expect(wrapper.is('span')).toBe(true)
  })
})
