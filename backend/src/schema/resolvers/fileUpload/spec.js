import fileUpload from '.'

const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}'

describe('fileUpload', () => {
  let params
  let uploadCallback

  beforeEach(() => {
    params = {
      uploadAttribute: {
        filename: 'avatar.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        createReadStream: jest.fn(),
      },
    }
    uploadCallback = jest.fn(({ uniqueFilename }) => uniqueFilename)
  })

  it('calls uploadCallback', async () => {
    await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
    expect(uploadCallback).toHaveBeenCalled()
  })

  describe('file name', () => {
    it('saves the upload url in params[url]', async () => {
      await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
      expect(params.attribute).toMatch(new RegExp(`^/uploads/${uuid}-avatar.jpg`))
    })

    it('creates a url safe name', async () => {
      params.uploadAttribute.filename = '/path/to/awkward?/ file-location/?foo- bar-avatar.jpg'
      await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
      expect(params.attribute).toMatch(new RegExp(`/uploads/${uuid}-foo-bar-avatar.jpg$`))
    })

    describe('in case of duplicates', () => {
      it('creates unique names to avoid overwriting existing files', async () => {
        const { attribute: first } = await fileUpload(
          {
            ...params,
          },
          { file: 'uploadAttribute', url: 'attribute' },
          uploadCallback,
        )
        const { attribute: second } = await fileUpload(
          {
            ...params,
          },
          { file: 'uploadAttribute', url: 'attribute' },
          uploadCallback,
        )
        expect(first).not.toEqual(second)
      })
    })
  })
})
