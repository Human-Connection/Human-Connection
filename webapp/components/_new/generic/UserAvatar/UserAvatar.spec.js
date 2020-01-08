import { mount } from '@vue/test-utils'
import UserAvatar from './UserAvatar.vue'
import BaseIcon from '~/components/_new/generic/BaseIcon/BaseIcon'

const localVue = global.localVue

describe('UserAvatar.vue', () => {
  let propsData, wrapper
  beforeEach(() => {
    propsData = {}
    wrapper = Wrapper()
  })

  const Wrapper = () => {
    return mount(UserAvatar, { propsData, localVue })
  }

  it('renders no image', () => {
    expect(wrapper.find('img').exists()).toBe(false)
  })

  // this is testing the style guide
  it('renders an icon', () => {
    expect(wrapper.find(BaseIcon).exists()).toBe(true)
  })

  describe('given a user', () => {
    describe('with no image', () => {
      beforeEach(() => {
        propsData = {
          user: {
            name: 'Matt Rider',
          },
        }
        wrapper = Wrapper()
      })

      describe('no user name', () => {
        it('renders an icon', () => {
          propsData = { user: { name: null } }
          wrapper = Wrapper()
          expect(wrapper.find(BaseIcon).exists()).toBe(true)
        })
      })

      describe("user name is 'Anonymous'", () => {
        it('renders an icon', () => {
          propsData = { user: { name: 'Anonymous' } }
          wrapper = Wrapper()
          expect(wrapper.find(BaseIcon).exists()).toBe(true)
        })
      })

      it('displays user initials', () => {
        expect(wrapper.find('.no-image').text()).toEqual('MR')
      })

      it('displays no more than 3 initials', () => {
        propsData = { user: { name: 'Ana Paula Nunes Marques' } }
        wrapper = Wrapper()
        expect(wrapper.find('.no-image').text()).toEqual('APN')
      })
    })

    describe('with a relative avatar url', () => {
      beforeEach(() => {
        propsData = {
          user: {
            avatar: '/avatar.jpg',
          },
        }
        wrapper = Wrapper()
      })

      it('adds a prefix to load the image from the uploads service', () => {
        expect(wrapper.find('img').attributes('src')).toBe('/api/avatar.jpg')
      })
    })

    describe('with an absolute avatar url', () => {
      beforeEach(() => {
        propsData = {
          user: {
            avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
          },
        }
        wrapper = Wrapper()
      })

      it('keeps the avatar URL as is', () => {
        // e.g. our seeds have absolute image URLs
        expect(wrapper.find('img').attributes('src')).toBe(
          'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
        )
      })
    })
  })
})
