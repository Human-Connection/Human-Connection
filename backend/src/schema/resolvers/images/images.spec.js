import { deleteImage, mergeImage } from './images'
import { getNeode, getDriver } from '../../../db/neo4j'
import Factory, { cleanDatabase } from '../../../db/factories'
import { UserInputError } from 'apollo-server'

const driver = getDriver()
const neode = getNeode()
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}'
let uploadCallback
let deleteCallback

beforeEach(async () => {
  await cleanDatabase()
  uploadCallback = jest.fn(({ uniqueFilename }) => `/uploads/${uniqueFilename}`)
  deleteCallback = jest.fn()
})

describe('deleteImage', () => {
  describe('given a resource with an image', () => {
    let user
    beforeEach(async () => {
      user = await Factory.build(
        'user',
        {},
        {
          avatar: Factory.build('image', {
            url: '/some/avatar/url/',
            alt: 'This is the avatar image of a user',
          }),
        },
      )
      user = await user.toJson()
    })

    it('soft deletes `Image` node', async () => {
      await expect(neode.all('Image')).resolves.toHaveLength(1)
      await deleteImage(user, 'AVATAR_IMAGE', { deleteCallback })
      await expect(neode.all('Image')).resolves.toHaveLength(0)
    })

    it('calls deleteCallback', async () => {
      user = await Factory.build('user')
      user = await user.toJson()
      await deleteImage(user, 'AVATAR_IMAGE', { deleteCallback })
      expect(deleteCallback).toHaveBeenCalled()
    })

    describe('given a transaction parameter', () => {
      it('executes cypher statements within the transaction', async () => {
        const session = driver.session()
        let someString
        try {
          someString = await session.writeTransaction(async (transaction) => {
            await deleteImage(user, 'AVATAR_IMAGE', {
              deleteCallback,
              transaction,
            })
            const txResult = await transaction.run('RETURN "Hello" as result')
            const [result] = txResult.records.map((record) => record.get('result'))
            return result
          })
        } finally {
          session.close()
        }
        await expect(neode.all('Image')).resolves.toHaveLength(0)
        await expect(someString).toEqual('Hello')
      })

      it('rolls back the transaction in case of errors', async (done) => {
        await expect(neode.all('Image')).resolves.toHaveLength(1)
        const session = driver.session()
        try {
          await session.writeTransaction(async (transaction) => {
            await deleteImage(user, 'AVATAR_IMAGE', {
              deleteCallback,
              transaction,
            })
            throw new Error('Ouch!')
          })
        } catch (err) {
          // nothing has been deleted
          await expect(neode.all('Image')).resolves.toHaveLength(1)
          // all good
          done()
        } finally {
          session.close()
        }
      })
    })
  })
})

describe('mergeImage', () => {
  let imageInput
  let post
  beforeEach(() => {
    imageInput = {
      alt: 'A description of the new image',
    }
  })

  describe('given image.upload', () => {
    beforeEach(() => {
      imageInput = {
        ...imageInput,
        upload: {
          filename: 'image.jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
          createReadStream: () => ({
            pipe: () => ({
              on: (_, callback) => callback(),
            }),
          }),
        },
      }
    })

    describe('on existing resource', () => {
      beforeEach(async () => {
        post = await Factory.build(
          'post',
          { id: 'p99' },
          {
            author: Factory.build('user', {}, { avatar: null }),
            image: null,
          },
        )
        post = await post.toJson()
      })

      it('returns new image', async () => {
        await expect(
          mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback }),
        ).resolves.toMatchObject({
          url: expect.any(String),
          alt: 'A description of the new image',
        })
      })

      it('calls upload callback', async () => {
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        expect(uploadCallback).toHaveBeenCalled()
      })

      it('creates `:Image` node', async () => {
        await expect(neode.all('Image')).resolves.toHaveLength(0)
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        await expect(neode.all('Image')).resolves.toHaveLength(1)
      })

      it('creates a url safe name', async () => {
        imageInput.upload.filename = '/path/to/awkward?/ file-location/?foo- bar-avatar.jpg'
        await expect(
          mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback }),
        ).resolves.toMatchObject({
          url: expect.stringMatching(new RegExp(`^/uploads/${uuid}-foo-bar-avatar.jpg`)),
        })
      })

      it.skip('automatically creates different image sizes', async () => {
        await expect(
          mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback }),
        ).resolves.toEqual({
          url: expect.any(String),
          alt: expect.any(String),
          urlW34: expect.stringMatching(new RegExp(`^/uploads/W34/${uuid}-image.jpg`)),
          urlW160: expect.stringMatching(new RegExp(`^/uploads/W160/${uuid}-image.jpg`)),
          urlW320: expect.stringMatching(new RegExp(`^/uploads/W320/${uuid}-image.jpg`)),
          urlW640: expect.stringMatching(new RegExp(`^/uploads/W640/${uuid}-image.jpg`)),
          urlW1024: expect.stringMatching(new RegExp(`^/uploads/W1024/${uuid}-image.jpg`)),
        })
      })

      it('connects resource with image via given image type', async () => {
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        const result = await neode.cypher(`
          MATCH(p:Post {id: "p99"})-[:HERO_IMAGE]->(i:Image) RETURN i,p
        `)
        post = neode.hydrateFirst(result, 'p', neode.model('Post'))
        const image = neode.hydrateFirst(result, 'i', neode.model('Image'))
        expect(post).toBeTruthy()
        expect(image).toBeTruthy()
      })

      it('whitelists relationship types', async () => {
        await expect(
          mergeImage(post, 'WHATEVER', imageInput, { uploadCallback, deleteCallback }),
        ).rejects.toEqual(new Error('Unknown relationship type WHATEVER'))
      })

      it('sets metadata', async () => {
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        const image = await neode.first('Image', {})
        await expect(image.toJson()).resolves.toMatchObject({
          alt: 'A description of the new image',
          createdAt: expect.any(String),
          url: expect.any(String),
        })
      })

      describe('given a transaction parameter', () => {
        it('executes cypher statements within the transaction', async () => {
          const session = driver.session()
          try {
            await session.writeTransaction(async (transaction) => {
              const image = await mergeImage(post, 'HERO_IMAGE', imageInput, {
                uploadCallback,
                deleteCallback,
                transaction,
              })
              return transaction.run(
                `
                MATCH(image:Image {url: $image.url})
                SET image.alt = 'This alt text gets overwritten'
                RETURN image {.*}
              `,
                { image },
              )
            })
          } finally {
            session.close()
          }
          const image = await neode.first('Image', { alt: 'This alt text gets overwritten' })
          await expect(image.toJson()).resolves.toMatchObject({
            alt: 'This alt text gets overwritten',
          })
        })

        it('rolls back the transaction in case of errors', async (done) => {
          const session = driver.session()
          try {
            await session.writeTransaction(async (transaction) => {
              const image = await mergeImage(post, 'HERO_IMAGE', imageInput, {
                uploadCallback,
                deleteCallback,
                transaction,
              })
              return transaction.run('Ooops invalid cypher!', { image })
            })
          } catch (err) {
            // nothing has been created
            await expect(neode.all('Image')).resolves.toHaveLength(0)
            // all good
            done()
          } finally {
            session.close()
          }
        })
      })

      describe('if resource has an image already', () => {
        beforeEach(async () => {
          const [post, image] = await Promise.all([
            neode.find('Post', 'p99'),
            Factory.build('image'),
          ])
          await post.relateTo(image, 'image')
        })

        it('calls deleteCallback', async () => {
          await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
          expect(deleteCallback).toHaveBeenCalled()
        })

        it('calls uploadCallback', async () => {
          await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
          expect(uploadCallback).toHaveBeenCalled()
        })

        it('updates metadata of existing image node', async () => {
          await expect(neode.all('Image')).resolves.toHaveLength(1)
          await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
          await expect(neode.all('Image')).resolves.toHaveLength(1)
          const image = await neode.first('Image', {})
          await expect(image.toJson()).resolves.toMatchObject({
            alt: 'A description of the new image',
            createdAt: expect.any(String),
            url: expect.any(String),
            // TODO
            // width:
            // height:
          })
        })
      })
    })
  })

  describe('without image.upload', () => {
    it('throws UserInputError', async () => {
      post = await Factory.build('post', { id: 'p99' }, { image: null })
      post = await post.toJson()
      await expect(mergeImage(post, 'HERO_IMAGE', imageInput)).rejects.toEqual(
        new UserInputError('Cannot find image for given resource'),
      )
    })

    describe('if resource has an image already', () => {
      beforeEach(async () => {
        post = await Factory.build(
          'post',
          {
            id: 'p99',
          },
          {
            author: Factory.build(
              'user',
              {},
              {
                avatar: null,
              },
            ),
            image: Factory.build('image', {
              alt: 'This is the previous, not updated image',
              url: '/some/original/url',
            }),
          },
        )
        post = await post.toJson()
      })

      it('does not call deleteCallback', async () => {
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        expect(deleteCallback).not.toHaveBeenCalled()
      })

      it('does not call uploadCallback', async () => {
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        expect(uploadCallback).not.toHaveBeenCalled()
      })

      it('updates metadata', async () => {
        await mergeImage(post, 'HERO_IMAGE', imageInput, { uploadCallback, deleteCallback })
        const images = await neode.all('Image')
        expect(images).toHaveLength(1)
        await expect(images.first().toJson()).resolves.toMatchObject({
          createdAt: expect.any(String),
          url: expect.any(String),
          alt: 'A description of the new image',
        })
      })
    })
  })
})
