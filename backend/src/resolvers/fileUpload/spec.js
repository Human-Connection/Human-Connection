import fileUpload from '.'

describe('fileUpload', () => {
  let params
  let uploadCallback

  beforeEach(() => {
    params = {
      uploadAttribute: {
        filename: 'avatar.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        createReadStream: jest.fn()
      }
    }
    uploadCallback = jest.fn()
  })

  it('calls uploadCallback', async () => {
    await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
    expect(uploadCallback).toHaveBeenCalled()
  })

  describe('file name', () => {
    it('saves the upload url in params[url]', async () => {
      await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
      expect(params.attribute).toMatch(/^\/uploads\/\d+-avatar$/)
    })

    it('uses the name without file ending', async () => {
      params.uploadAttribute.filename = 'somePng.png'
      await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
      expect(params.attribute).toMatch(/^\/uploads\/\d+-somePng/)
    })

    it('creates a url safe name', async () => {
      params.uploadAttribute.filename = '/path/to/awkward?/ file-location/?foo- bar-avatar.jpg?foo- bar'
      await fileUpload(params, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
      expect(params.attribute).toMatch(/^\/uploads\/\d+-foo-bar-avatar$/)
    })

    describe('in case of duplicates', () => {
      it('creates unique names to avoid overwriting existing files', async () => {
        const { attribute: first } = await fileUpload({
          ...params
        }, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)

        await new Promise(resolve => setTimeout(resolve, 1000))
        const { attribute: second } = await fileUpload({
          ...params
        }, { file: 'uploadAttribute', url: 'attribute' }, uploadCallback)
        expect(first).not.toEqual(second)
      })
    })
  })
})
