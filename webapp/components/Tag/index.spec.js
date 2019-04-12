import { shallowMount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Tag from './index'

const localVue = createLocalVue()
localVue.use(Styleguide)

describe('Tag', () => {
  let name

  let Wrapper = () => {
    return shallowMount(Tag, {
      localVue,
      propsData: {
        name
      }
    })
  }

  describe('given a String for Name', () => {
    beforeEach(() => {
      name = 'Liebe'
    })

    it('shows Name', () => {
      expect(Wrapper().text()).toContain('Liebe')
    })
  })
})
