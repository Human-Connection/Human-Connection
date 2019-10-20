import { valuesReasonCategoryOptions } from '~/constants/modals.js'

export default function validReport({ translate }) {
  return {
    formSchema: {
      reasonCategory: {
        type: 'object',
        required: true,
        fields: {
          value: {
            type: 'enum',
            enum: valuesReasonCategoryOptions,
            required: true,
            message: translate('report.reason.category.invalid'),
          },
        },
      },
      reasonDescription: {
        type: 'string',
        min: 0,
        max: 200,
      },
    },
  }
}
