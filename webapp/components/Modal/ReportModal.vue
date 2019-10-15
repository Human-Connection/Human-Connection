<template>
  <ds-modal :title="title" :is-open="isOpen" @cancel="cancel">
    <transition name="ds-transition-fade">
      <ds-flex v-if="success" class="hc-modal-success" centered>
        <sweetalert-icon icon="success" />
      </ds-flex>
    </transition>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />

    <ds-radio
      :value="form.reasonCategory"
      :schema="formSchema.reasonCategory"
      :label="$t('report.reason.category.label')"
      :options="form.reasonCategoryOptions"
      labelProp="label"
    />
    <ds-input
      class="reason-description"
      :value="form.reasonDescription"
      :schema="formSchema.reasonDescription"
      :label="$t('report.reason.description.label')"
      :placeholder="$t('report.reason.description.placeholder')"
      type="textarea"
      rows="5"
    />
    <small class="smallTag">
      {{ form.reasonDescription.length }}/{{ formSchema.reasonDescription.max }}
    </small>
    <ds-space />

    <template slot="footer">
      <ds-button class="cancel" icon="close" @click="cancel">{{ $t('report.cancel') }}</ds-button>

      <ds-button
        danger
        class="confirm"
        icon="exclamation-circle"
        :disabled="failsValidations"
        :loading="loading"
        @click="confirm"
      >
        {{ $t('report.submit') }}
      </ds-button>
    </template>
  </ds-modal>
</template>

<script>
import { SweetalertIcon } from 'vue-sweetalert-icons'
import { reportMutation } from '~/graphql/Moderation.js'

export default {
  name: 'ReportModal',
  components: {
    SweetalertIcon,
  },
  props: {
    name: { type: String, default: '' },
    type: { type: String, required: true },
    id: { type: String, required: true },
  },
  data() {
    // this list equals to enums in GraphQL schema file "backend/src/schema/types/type/REPORTED.gql"
    let valuesReasonCategoryOptions = [
      'discrimination_etc',
      'pornographic_content_links',
      'glorific_trivia_of_cruel_inhuman_acts',
      'doxing',
      'intentional_intimidation_stalking_persecution',
      'advert_products_services_commercial',
      'criminal_behavior_violation_german_law',
      'other',
    ]

    let reasonCategoryOptions = []
    valuesReasonCategoryOptions.forEach(reasonCategory => {
      reasonCategoryOptions.push({
        label: this.$t('report.reason.category.options.' + reasonCategory),
        value: reasonCategory,
      })
    })

    return {
      isOpen: true,
      success: false,
      loading: false,
      failsValidations: true,
      form: {
        reasonCategory: null,
        reasonCategoryOptions,
        reasonDescription: '',
      },
      formSchema: {
        reasonCategory: {
          type: 'enum',
          required: true,
          validator: (rule, value, callback, source, options) => {
            this.form.reasonCategory = value
            this.failsValidations = !this.form.reasonCategory
            callback()
          },
        },
        reasonDescription: {
          type: 'string',
          min: 0,
          max: 200,
          validator: (rule, value, callback, source, options) => {
            this.form.reasonDescription = value
            callback()
          },
        },
      },
    }
  },
  computed: {
    title() {
      return this.$t(`report.${this.type}.title`)
    },
    message() {
      const name = this.$filters.truncate(this.name, 30)
      return this.$t(`report.${this.type}.message`, { name })
    },
  },
  methods: {
    async cancel() {
      // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
      // await this.modalData.buttons.cancel.callback()
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      const { reasonCategory, reasonDescription } = this.form

      this.loading = true
      // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
      // await this.modalData.buttons.confirm.callback()
      this.$apollo
        .mutate({
          mutation: reportMutation(),
          variables: {
            resourceId: this.id,
            reasonCategory: reasonCategory.value,
            reasonDescription,
          },
        })
        .then(({ _data }) => {
          this.success = true
          this.$toast.success(this.$t('report.success'))
          setTimeout(() => {
            this.isOpen = false
            setTimeout(() => {
              this.success = false
              this.$emit('close')
            }, 500)
          }, 1500)
          this.loading = false
        })
        .catch(err => {
          this.$emit('close')
          this.success = false
          switch (err.message) {
            case 'GraphQL error: User':
              this.$toast.error(this.$t('report.user.error'))
              break
            case 'GraphQL error: Post':
              this.$toast.error(this.$t('report.contribution.error'))
              break
            case 'GraphQL error: Comment':
              this.$toast.error(this.$t('report.comment.error'))
              break
          }
          this.loading = false
        })
    },
  },
}
</script>

<style lang="scss">
.ds-modal {
  max-width: 600px !important;
}
.ds-radio-option:not(.ds-button) {
  width: 100% !important;
}
.ds-radio-option-label {
  margin: 5px 20px 5px 5px !important;
  width: 100% !important;
}
.reason-description {
  margin-top: $space-x-small !important;
  margin-bottom: $space-xx-small !important;
}
.smallTag {
  width: 100%;
  position: relative;
  left: 90%;
}
.hc-modal-success {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #fff;
  opacity: 1;
  z-index: $z-index-modal;
  border-radius: $border-radius-x-large;
}
</style>
