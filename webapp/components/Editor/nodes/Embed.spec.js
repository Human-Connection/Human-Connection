import { shallowMount } from '@vue/test-utils'
import Embed from './Embed'

let Wrapper
let propsData
const someUrl = 'https://www.youtube.com/watch?v=qkdXAtO40Fo'

describe('Embed.vue', () => {
  beforeEach(() => {
    propsData = {}
    const component = new Embed()
    Wrapper = ({ propsData }) => {
      return shallowMount(component.view, { propsData })
    }
  })

  describe('given a href', () => {
    describe("onEmbed returned embed data of type 'video'", () => {
      it('renders a video-embed component', async () => {
        propsData.options = {
          onEmbed: () => ({
            __typename: 'Embed',
            type: 'video',
            title: 'Baby Loves Cat',
            author: 'Merkley Family',
            publisher: 'YouTube',
            date: '2015-08-16T00:00:00.000Z',
            description:
              'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
            url: someUrl,
            image: 'https://i.ytimg.com/vi/qkdXAtO40Fo/maxresdefault.jpg',
            audio: null,
            video: null,
            lang: 'de',
            sources: ['resource', 'oembed'],
          }),
        }
        propsData.node = { attrs: { href: 'https://www.youtube.com/watch?v=qkdXAtO40Fo' } }
        const wrapper = await Wrapper({ propsData })
        expect(wrapper.contains('video-embed-stub')).toBe(true)
      })
    })

    describe("onEmbed returned embed data of type 'photo'", () => {
      it('renders an image-embed component', async () => {
        propsData.node = {
          attrs: {
            href: 'https://www.flickr.com/photos/billmcmullen/48740742012/in/explore-2019-09-16/',
          },
        }
        propsData.options = {
          onEmbed: () => ({
            type: 'photo',
            __typename: 'Embed',
            audio: null,
            author: 'Bill McMullen',
            date: '2019-09-17T14:43:39.794Z',
            description: 'Gray tree frog blends into its surroundings.',
            image: 'https://live.staticflickr.com/65535/48740742012_c8bb376483_b.jpg',
            lang: 'en',
            logo: null,
            publisher: 'Flickr',
            sources: [('resource', 'oembed')],
            title: 'Blended',
            url: 'https://www.flickr.com/photos/billmcmullen/48740742012/',
            video: null,
          }),
        }
        const wrapper = await Wrapper({ propsData })
        expect(wrapper.contains('image-embed-stub')).toBe(true)
      })
    })

    describe("onEmbed returned embed data of type 'link'", () => {
      it('renders an link-embed component', async () => {
        propsData.node = { attrs: { href: 'https://www.iamcal.com/book/' } }
        propsData.options = {
          onEmbed: () => ({
            __typename: 'Embed',
            audio: null,
            author: null,
            date: '2006-08-04T22:00:00.000Z',
            description: null,
            image: 'https://www.iamcal.com/book/cover_large.png',
            lang: null,
            logo: null,
            publisher: 'YouTube',
            sources: ['resource'],
            title: 'Building Scalable Web Sites',
            type: 'link',
            url: 'https://www.iamcal.com/book/',
            video: null,
          }),
        }
        const wrapper = await Wrapper({ propsData })
        expect(wrapper.contains('link-embed-stub')).toBe(true)
      })
    })

    describe('onEmbed returned embed data with no type, but a publisher and url', () => {
      it('renders an link-embed component', async () => {
        propsData.node = { attrs: { href: 'https://www.not-sure-which-link/no-type-returned' } }
        propsData.options = {
          onEmbed: () => ({
            __typename: 'Embed',
            audio: null,
            author: null,
            date: '2006-08-04T22:00:00.000Z',
            description: null,
            image: 'https://www.iamcal.com/book/cover_large.png',
            lang: null,
            logo: null,
            publisher: 'YouTube',
            sources: ['resource'],
            title: 'Building Scalable Web Sites',
            type: null,
            url: 'https://www.iamcal.com/book/',
            video: null,
          }),
        }
        const wrapper = await Wrapper({ propsData })
        expect(wrapper.contains('link-embed-stub')).toBe(true)
      })
    })

    describe('onEmbed returned no meta data', () => {
      it('renders a default-embed component', async () => {
        propsData.node = { attrs: { href: 'https://www.youtube.com/watch?v=qkdXAtO40Fo' } }
        propsData.options = {
          onEmbed: () => ({}),
        }
        const wrapper = await Wrapper({ propsData })
        expect(wrapper.contains('default-embed-stub')).toBe(true)
      })
    })
  })
})
