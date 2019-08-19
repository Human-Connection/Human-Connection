import { shallowMount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Tag from './'

const localVue = createLocalVue()
localVue.use(Styleguide)

describe('Tag', () => {
  let id

  let Wrapper = () => {
    return shallowMount(Tag, {
      localVue,
      propsData: {
        id,
      },
    })
  }

  describe('given a String for Name', () => {
    beforeEach(() => {
      id = 'Liebe'
    })

    it('shows Name', () => {
      expect(Wrapper().text()).toContain('Liebe')
    })
  })
})
