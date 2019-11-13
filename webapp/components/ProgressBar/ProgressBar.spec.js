import { mount } from '@vue/test-utils'
import ProgressBar from './ProgressBar'

describe('ProgessBar.vue', () => {
  let propsData

  beforeEach(() => {
    propsData = {
      goal: 50000,
      progress: 10000,
    }
  })

  const Wrapper = () => mount(ProgressBar, { propsData })

  describe('given only goal and progress', () => {
    it('renders no title', () => {
      expect(
        Wrapper()
          .find('.progress-bar__title')
          .exists(),
      ).toBe(false)
    })

    it('renders no label', () => {
      expect(
        Wrapper()
          .find('.progress-bar__label')
          .exists(),
      ).toBe(false)
    })

    it('calculates the progress bar width as a percentage of the goal', () => {
      expect(Wrapper().vm.progressBarWidth).toBe('width: 20%;')
    })
  })

  describe('given a title', () => {
    beforeEach(() => {
      propsData.title = 'This is progress'
    })

    it('renders the title', () => {
      expect(
        Wrapper()
          .find('.progress-bar__title')
          .text(),
      ).toBe('This is progress')
    })
  })

  describe('given a label', () => {
    beforeEach(() => {
      propsData.label = 'Going well'
    })

    it('renders the label', () => {
      expect(
        Wrapper()
          .find('.progress-bar__label')
          .text(),
      ).toBe('Going well')
    })
  })
})
