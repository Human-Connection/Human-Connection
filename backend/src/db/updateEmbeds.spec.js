import { transform } from './updateEmbeds'
import legacySamples from './test/20200402150445-update-embeds/samples_legacy.json'
import targetSamples from './test/20200402150445-update-embeds/samples_target.json'
import productionSamples from './test/20200402150445-update-embeds/samples_production.json'

describe('updateEmbeds', () => {
  describe('transform', () => {
    Object.keys(legacySamples).forEach((key) => {
      it(`converts the ${key} sample`, () => {
        expect(transform(legacySamples[key])).toBe(targetSamples[key])
      })
    })
    it('converts all production samples', () => {
      productionSamples.forEach((sample) => expect(transform(sample.legacy)).toBe(sample.target))
    })
  })
})
