import Factory, { cleanDatabase, postWithEmbed } from './factories'
import { transform } from './updateEmbeds'
import storybookSamples from './test/20200402150445-update-embeds/samples_storybook.json'
import productionSamples from './test/20200402150445-update-embeds/samples_production.json'

const inlineEmbedExpr = /<p>[^<]*<a.*?class="embed".*?>[^<]*<\/p>/

describe('updateEmbeds', () => {
  let randomSamples

  beforeAll(async () => {
    // pre-build the dependencies for Posts, so
    // the Post factory doesn't create one for each sample
    const category = await Factory.build('category')
    const user = await Factory.build('user')
    const image = await Factory.build('image')
    randomSamples = new Array(100).fill(0).map(() =>
      postWithEmbed.attributes(
        {},
        {
          categoryIds: [category.get('id')],
          authorId: user.get('id'),
          image,
        },
      ),
    )
  })

  afterAll(cleanDatabase)

  describe('postWithEmbed factory', () => {
    it('creates posts with legacy/inline embeds', async () => {
      expect(postWithEmbed.attributes().content).toMatch(inlineEmbedExpr)
    })
  })

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

    it("doesn't fail on 100 random samples", () => {
      randomSamples.forEach((sample) =>
        expect(transform(sample.content)).not.toMatch(inlineEmbedExpr),
      )
    })
  })
})
