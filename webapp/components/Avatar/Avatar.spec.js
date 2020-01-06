import { mount } from '@vue/test-utils'
import Avatar from './Avatar.vue'
import Vue from 'vue'
import Vuetify from 'vuetify'

const localVue = global.localVue
Vue.use(Vuetify)
describe('Avatar.vue', () => {
  let propsData = {}

  const Wrapper = () => {
    return mount(Avatar, { propsData, localVue })
  }

  it('renders no image', () => {
    expect(
      Wrapper()
        .find('.v-image')
        .exists(),
    ).toBe(false)
  })

  // this is testing the style guide
  it('renders an icon', () => {
    expect(
      Wrapper()
        .find('.ds-icon')
        .exists(),
    ).toBe(true)
  })

  describe('given an image', () => {
    describe('with a relative avatar url', () => {
      beforeEach(() => {
        propsData = {
          image: '/avatar.jpg',
        }
      })

      it('adds a prefix to load the image from the uploads service', () => {
        expect(
          Wrapper()
            .find('.v-image')
            .exists(),
        ).toBe(true)
      })
    })

    describe('with an absolute avatar url', () => {
      beforeEach(() => {
        propsData = {
          image: 'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
        }
      })

      it('keeps the avatar URL as is', () => {
        // e.g. our seeds have absolute image URLs
        expect(
          Wrapper()
            .find('.v-image')
            .exists(),
        ).toBe(true)
      })
    })
  })
})
