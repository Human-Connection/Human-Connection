<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
    :width="{ base: '100%', sm: '200px', md: '200px', lg: '200px' }"
    @cancel="cancel"
  >
    <transition name="ds-transition-fade">
      <ds-flex v-if="success" class="hc-modal-success" centered>
        <sweetalert-icon icon="success" />
      </ds-flex>
    </transition>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />

    <!-- Wolle <ds-form ref="reportForm" v-model="form" :schema="formSchema"> -->
    <!-- Wolle <ds-radio
        model="reasonCategory"
        :label="$t('report.reason.category.label')"
        :options="form.reasonCategoryOptions"
        :placeholder="$t('report.reason.category.placeholder')"
      /> -->
    <ds-radio
      :value="form.reasonCategory"
      :schema="formSchema.reasonCategory"
      :label="$t('report.reason.category.label')"
      :options="form.reasonCategoryOptions"
    />
    <!-- Wolle <ds-input
        model="reasonAddText"
        :label="$t('report.reason.addText.label')"
        :placeholder="$t('report.reason.addText.placeholder')"
        type="textarea"
        rows="5"
        class="reasonAddText"
      /> -->
    <ds-input
      :value="form.reasonAddText"
      :schema="formSchema.reasonAddText"
      :label="$t('report.reason.addText.label')"
      :placeholder="$t('report.reason.addText.placeholder')"
      type="textarea"
      rows="5"
      class="reasonAddText"
    />
    <small class="smallTag">
      {{ form.reasonAddText.length }}/{{ formSchema.reasonAddText.max }}
    </small>
    <ds-space />
    <!-- Wolle </ds-form> -->

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
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'

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
    const valuesReasonCategoryOptions = [
      'discrimination-etc',
      'pornographic-content-links',
      'glorific-trivia-of-cruel-inhuman-acts',
      'doxing',
      'intentional-intimidation-stalking-persecution',
      'advert-products-services-commercial',
      'criminal-behavior-violation-german-law',
      'other',
    ]
    let reasonCategoryOptions = []
    valuesReasonCategoryOptions.forEach((categoryId, index) => {
      reasonCategoryOptions[index] = {
        label: this.$t('report.reason.category.options.' + categoryId),
        value: categoryId,
      }
    })

    return {
      isOpen: true,
      success: false,
      loading: false,
      failsValidations: true,
      form: {
        reasonCategory: null,
        // Wolle reasonCategory: reasonCategoryOptions[0],
        reasonCategoryOptions,
        reasonAddText: '',
      },
      formSchema: {
        reasonCategory: {
          type: 'enum',
          required: true,
          validator: (rule, value, callback, source, options) => {
            // Wolle console.log('value: ', value)
            this.form.reasonCategory = value
            // Wolle console.log('this.form.reasonCategory: ', this.form.reasonCategory)
            this.failsValidations = !this.form.reasonCategory
            // Wolle console.log('this.failsValidations: ', this.failsValidations)
            callback()
          },
        },
        reasonAddText: {
          type: 'string',
          min: 0,
          max: 200,
          validator: (rule, value, callback, source, options) => {
            this.form.reasonAddText = value
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
    // Wolle toggleReasonCategory(reasonCategory) {
    //   console.log('reasonCategory: ', reasonCategory)
    //   console.log('this.form.reasonCategory: ', this.form.reasonCategory)
    //   this.failsValidations = false
    // },
    // Wolle inputReasonAddText(reasonAddText) {
    //   console.log('reasonAddText: ', reasonAddText)
    //   this.form.reasonAddText = reasonAddText
    // },
    async cancel() {
      // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
      // await this.modalData.buttons.cancel.callback()
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      const { reasonCategory, reasonAddText } = this.form
      console.log('reasonCategory: ', reasonCategory)
      console.log('reasonAddText: ', reasonAddText)

      this.loading = true
      // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
      // await this.modalData.buttons.confirm.callback()
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!) {
              report(id: $id) {
                id
              }
            }
          `,
          variables: { id: this.id },
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
.reasonAddText {
  margin-top: $space-x-small;
  margin-bottom: $space-xxx-small;
}
.smallTag {
  width: 100%;
  position: relative;
  left: 90%;
  margin-top: $space-xxx-small;
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
