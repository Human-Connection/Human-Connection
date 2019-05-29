import { mount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Avatar from './Avatar.vue'

const localVue = createLocalVue()
localVue.use(Styleguide)

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
            avatar: 'http://lorempixel.com/640/480/animals',
          },
        }
      })

      it('keeps the avatar URL as is', () => {
        // e.g. our seeds have absolute image URLs
        expect(
          Wrapper()
            .find('img')
            .attributes('src'),
        ).toBe('http://lorempixel.com/640/480/animals')
      })
    })
  })
})
