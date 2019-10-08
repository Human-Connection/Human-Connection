import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import Embed from './Embed'

let Wrapper, propsData, component
const someUrl = 'https://www.youtube.com/watch?v=qkdXAtO40Fo'
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('Embed.vue', () => {
  beforeEach(() => {
    propsData = {}
    component = new Embed()
    Wrapper = ({ propsData }) => {
      return shallowMount(component.view, { propsData })
    }
  })

  describe('given a href', () => {
    describe('onEmbed returned embed data', () => {
      beforeEach(() => {
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
            html:
              '<iframe width="480" height="270" src="https://www.youtube.com/embed/qkdXAtO40Fo?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
          }),
        }
      })

      it('renders the given html code', async () => {
        propsData.node = { attrs: { href: 'https://www.youtube.com/watch?v=qkdXAtO40Fo' } }
        const wrapper = Wrapper({ propsData })
        await wrapper.html()
        expect(wrapper.contains('embed-component-stub')).toBe(true)
      })
    })

    describe('without embedded html but some meta data instead', () => {
      it.todo('renders description and link')
    })

    describe('without any meta data', () => {
      it.todo('renders a link without `embed` class')
    })
  })
})
