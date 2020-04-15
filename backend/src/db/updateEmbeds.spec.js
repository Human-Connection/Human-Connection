import { transform } from './updateEmbeds'
import storybookSamples from './test/20200402150445-update-embeds/samples_storybook.json'
import productionSamples from './test/20200402150445-update-embeds/samples_production.json'

describe('updateEmbeds', () => {
  describe('transform', () => {
    describe('synthetic storybook samples', () => {
      storybookSamples.forEach((sample) => {
        it(`transforms ${sample.type} content`, () => {
          expect(transform(sample.legacy)).toBe(sample.target)
        })
      })
    })
    describe('production samples', () => {
      productionSamples.forEach((sample) => {
        it(`transforms ${sample.type} content`, () => {
          expect(transform(sample.legacy)).toBe(sample.target)
        })
      })
    })
  })
})
