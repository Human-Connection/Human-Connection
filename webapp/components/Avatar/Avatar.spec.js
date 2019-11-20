import { mount } from '@vue/test-utils'
import Avatar from './Avatar.vue'

const localVue = global.localVue

describe('Avatar.vue', () => {
  let propsData = {}

  const Wrapper = () => {
    return mount(Avatar, { propsData, localVue })
  }

  it('renders no image', () => {
    expect(
      Wrapper()
        .find('img')
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

  describe('given a user', () => {
    describe('with a relative avatar url', () => {
      beforeEach(() => {
        propsData = {
          user: {
            avatar: '/avatar.jpg',
          },
        }
      })

      it('adds a prefix to load the image from the uploads service', () => {
        expect(
          Wrapper()
            .find('img')
            .attributes('src'),
        ).toBe('/api/avatar.jpg')
      })
    })

    describe('with an absolute avatar url', () => {
      beforeEach(() => {
        propsData = {
          user: {
            avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
          },
        }
      })

      it('keeps the avatar URL as is', () => {
        // e.g. our seeds have absolute image URLs
        expect(
          Wrapper()
            .find('img')
            .attributes('src'),
        ).toBe('https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg')
      })
    })
  })
})
