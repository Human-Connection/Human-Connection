import { shallowMount } from '@vue/test-utils'
import Image from '.'

describe('Image', () => {
  let propsData = { imageProps: { class: 'hc-badge', src: '' } }

  const Wrapper = () => {
    return shallowMount(Image, { propsData })
  }

  it('renders', () => {
    expect(Wrapper().is('img')).toBe(true)
  })

  it('passes properties down to `img`', () => {
    expect(Wrapper().classes()).toEqual(['hc-badge'])
  })

  describe('given a relative `src`', () => {
    beforeEach(() => {
      propsData.imageProps.src = '/img/badges/fundraisingbox_de_airship.svg'
    })

    it('adds a prefix to load the image from the backend', () => {
      expect(Wrapper().attributes('src')).toBe('/api/img/badges/fundraisingbox_de_airship.svg')
    })
  })

  describe('given an absolute `src`', () => {
    beforeEach(() => {
      propsData.imageProps.src = 'http://lorempixel.com/640/480/animals'
    })

    it('keeps the URL as is', () => {
      // e.g. our seeds have absolute image URLs
      expect(Wrapper().attributes('src')).toBe('http://lorempixel.com/640/480/animals')
    })
  })
})
