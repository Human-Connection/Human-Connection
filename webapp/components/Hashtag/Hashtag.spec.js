import { config, shallowMount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Hashtag from './Hashtag'

const localVue = createLocalVue()
localVue.use(Styleguide)

config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('Hashtag', () => {
  let id

  const Wrapper = () => {
    return shallowMount(Hashtag, {
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
