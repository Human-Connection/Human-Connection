import { mount } from '@vue/test-utils'

import ResponsiveImage from './ResponsiveImage'

const localVue = global.localVue

describe('ResponsiveImage.vue', () => {
  const propsData = {}
  let wrapper

  const Wrapper = () => {
    return mount(ResponsiveImage, { propsData, localVue })
  }

  describe('mount', () => {
    describe('with empty image prop', () => {
      it('renders nothing', () => {
        wrapper = Wrapper()
        expect(wrapper.html()).toEqual('')
      })
    })

    describe('givem `null` as image prop', () => {
      beforeEach(() => {
        propsData.image = null
      })

      it('renders nothing', () => {
        wrapper = Wrapper()
        expect(wrapper.html()).toEqual('')
      })
    })

    describe('given image with absolute url', () => {
      beforeEach(() => {
        propsData.image = { url: 'https://example.org/somewhere.jpg' }
      })

      it('renders image tag', () => {
        wrapper = Wrapper()
        expect(wrapper.html()).toEqual('<img src="https://example.org/somewhere.jpg">')
      })

      describe('given image attributes prefixed with `w`', () => {
        beforeEach(() => {
          propsData.image.w320 = { url: 'https://example.org/somewhere-320.jpg' }
          propsData.image.w640 = { url: 'https://example.org/somewhere-640.jpg' }
        })

        it('adds srcset', () => {
          wrapper = Wrapper()
          expect(wrapper.html()).toEqual(
            '<img srcset="https://example.org/somewhere-320.jpg 320w, https://example.org/somewhere-640.jpg 640w" src="https://example.org/somewhere.jpg">',
          )
        })
      })
    })

    describe('given image with relative url', () => {
      beforeEach(() => {
        propsData.image = { url: '/somewhere' }
      })

      it('proxies image url to `/api`', () => {
        wrapper = Wrapper()
        expect(wrapper.html()).toEqual('<img src="/api/somewhere">')
      })
    })
  })
})
