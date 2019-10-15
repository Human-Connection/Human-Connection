import validReport from './ReportModal'
import Schema from 'async-validator'

let translate

beforeEach(() => {
  translate = jest.fn(() => 'Validation error')
})

describe('validReport', () => {
  let validate = object => {
    const { formSchema } = validReport({ translate })
    const validator = new Schema(formSchema)
    return validator.validate(object, { suppressWarning: true }).catch(({ errors }) => {
      throw new Error(errors[0].message)
    })
  }

  describe('reasonCategory', () => {
    describe('invalid enum', () => {
      it('rejects', async () => {
        await expect(validate({ reasonCategory: { value: 'invalid_enum' } })).rejects.toThrow(
          'Validation error',
        )
      })
    })

    describe('valid enum', () => {
      it('resolves', async () => {
        await expect(
          validate({ reasonCategory: { value: 'discrimination_etc' } }),
        ).resolves.toBeUndefined()
      })
    })
  })
})
