import { config, shallowMount } from '@vue/test-utils'

import Hashtag from './Hashtag'

const localVue = global.localVue

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
