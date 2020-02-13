<template>
  <ds-modal :title="title" :is-open="isOpen" @cancel="cancel">
    <transition name="ds-transition-fade">
      <ds-flex v-if="success" class="hc-modal-success" centered>
        <sweetalert-icon icon="success" />
      </ds-flex>
    </transition>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />
    <!-- Wolle <ds-radio
      v-model="form.reasonCategory"
      :schema="formSchema.reasonCategory"
      :label="$t('report.reason.category.label')"
      :options="form.reasonCategoryOptions"
      labelProp="label"
    /> -->
    <ds-text class="ds-text-soft">
      {{ $t('moderation.reports.decideModal.reason.category.label') }}
    </ds-text>
    <ds-text v-for="(reasonCategory, index) in form.reasonCategoryOptions" :key="index">
      <input
        id="checkbox"
        type="checkbox"
        v-model="reasonCategory.checked"
        :checked="reasonCategory.checked"
      />
      &nbsp;
      <label for="checkbox" v-html="reasonCategory.label"></label>
    </ds-text>
    <!-- reasonDescription -->
    <ds-input
      class="ds-input-description"
      v-model="form.reasonDescription"
      :schema="formSchema.reasonDescription"
      :label="$t('moderation.reports.decideModal.reason.optionalDescription.label')"
      :placeholder="$t('moderation.reports.decideModal.reason.optionalDescription.placeholder')"
      type="textarea"
      rows="5"
    />
    <small class="smallTag">
      {{ form.reasonDescription.length }}/{{ formSchema.reasonDescription.max }}
    </small>
    <ds-space />
    <!-- internalDescription -->
    <ds-input
      class="ds-input-description"
      v-model="form.internalDescription"
      :schema="formSchema.internalDescription"
      :label="$t('moderation.reports.decideModal.reason.internalDescription.label')"
      :placeholder="$t('moderation.reports.decideModal.reason.internalDescription.placeholder')"
      type="textarea"
      rows="5"
    />
    <small class="smallTag">
      {{ form.internalDescription.length }}/{{ formSchema.internalDescription.max }}
    </small>
    <ds-space />
    <template #footer>
      <base-button
        class="cancel"
        :danger="!modalData.buttons.confirm.danger"
        :icon="modalData.buttons.cancel.icon"
        @click="cancel"
      >
        {{ $t(modalData.buttons.cancel.textIdent) }}
      </base-button>

      <base-button
        :danger="modalData.buttons.confirm.danger"
        filled
        class="confirm"
        :icon="modalData.buttons.confirm.icon"
        :disabled="!isReasonCategoryChecked"
        :loading="loading"
        @click="confirm"
      >
        {{ $t(modalData.buttons.confirm.textIdent) }}
      </base-button>
    </template>
  </ds-modal>
</template>

<script>
import { SweetalertIcon } from 'vue-sweetalert-icons'
// Wolle import { reportMutation } from '~/graphql/Moderation.js'
import { valuesReasonCategoryOptions } from '~/constants/modals.js'
import validReport from '~/components/utils/DecideModal'

export default {
  name: 'DecideModal',
  components: {
    SweetalertIcon,
  },
  props: {
    name: { type: String, default: '' },
    type: { type: String, required: true },
    modalData: { type: Object, required: true },
    id: { type: String, required: true },
  },
  data() {
    return {
      isOpen: true,
      success: false,
      loading: false,
      form: {
        // Wolle reasonCategory: null,
        reasonCategoryOptions: [],
        reasonDescription: '',
        internalDescription: '',
      },
    }
  },
  created() {
    this.form.reasonCategoryOptions = valuesReasonCategoryOptions.map(reasonCategory => {
      return {
        label: this.$t('report.reason.category.options.' + reasonCategory),
        value: reasonCategory,
        checked: false,
      }
    })
  },
  computed: {
    // Wolle title() {
    //   return this.$t(`report.${this.type}.title`)
    // },
    // message() {
    //   const name = this.$filters.truncate(this.name, 30)
    //   return this.$t(`report.${this.type}.message`, { name })
    // },
    title() {
      return this.$t(this.modalData.titleIdent)
    },
    message() {
      return this.$t(this.modalData.messageIdent, this.modalData.messageParams)
    },
    formSchema() {
      const validReportSchema = validReport({ translate: this.$t })
      return {
        ...validReportSchema.formSchema,
      }
    },
    isReasonCategoryChecked() {
      return this.form.reasonCategoryOptions.find(el => el.checked)
    },
  },
  methods: {
    // Wolle async cancel() {
    //   // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
    //   // await this.modalData.buttons.cancel.callback()
    //   this.isOpen = false
    //   setTimeout(() => {
    //     this.$emit('close')
    //   }, 1000)
    // },
    async cancel() {
      await this.modalData.buttons.cancel.callback()
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    // Wolle async confirm() {
    //   const { reasonCategory, reasonDescription } = this.form
    //   this.loading = true
    //   // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
    //   // await this.modalData.buttons.confirm.callback()
    //   this.$apollo
    //     .mutate({
    //       mutation: reportMutation(),
    //       variables: {
    //         resourceId: this.id,
    //         reasonCategory: reasonCategory.value,
    //         reasonDescription,
    //       },
    //     })
    //     .then(({ _data }) => {
    //       this.success = true
    //       this.$toast.success(this.$t('report.success'))
    //       setTimeout(() => {
    //         this.isOpen = false
    //         setTimeout(() => {
    //           this.success = false
    //           this.$emit('close')
    //         }, 500)
    //       }, 1500)
    //       this.loading = false
    //     })
    //     .catch(err => {
    //       this.$emit('close')
    //       this.success = false
    //       switch (err.message) {
    //         case 'GraphQL error: User':
    //           this.$toast.error(this.$t('report.user.error'))
    //           break
    //         case 'GraphQL error: Post':
    //           this.$toast.error(this.$t('report.contribution.error'))
    //           break
    //         case 'GraphQL error: Comment':
    //           this.$toast.error(this.$t('report.comment.error'))
    //           break
    //         default:
    //           this.$toast.error(err.message)
    //       }
    //       this.isOpen = false
    //       this.loading = false
    //     })
    // },
    async confirm() {
      this.loading = true
      try {
        await this.modalData.buttons.confirm.callback({
          reasonCategoryAry: this.form.reasonCategoryOptions
            .filter(el => el.checked)
            .map(el => el.value),
          reasonDescription: this.form.reasonDescription,
        })
        this.success = true
        setTimeout(() => {
          this.isOpen = false
          setTimeout(() => {
            this.success = false
            this.$emit('close')
          }, 500)
        }, 1500)
      } catch (err) {
        this.success = false
        this.$emit('close')
        switch (err.message) {
          // Wolle actualise
          case 'GraphQL error: User':
            this.$toast.error(this.$t('report.user.error'))
            break
          // Wolle actualise
          case 'GraphQL error: Post':
            this.$toast.error(this.$t('report.contribution.error'))
            break
          // Wolle actualise
          case 'GraphQL error: Comment':
            this.$toast.error(this.$t('report.comment.error'))
            break
          default:
            this.$toast.error(err.message)
        }
        this.isOpen = false
        this.loading = false
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss">
.ds-modal {
  max-width: 700px !important;
}
.ds-radio-option {
  width: 100% !important;
}
.ds-radio-option-label {
  margin: 5px 20px 5px 5px !important;
  width: 100% !important;
}
.ds-text-soft {
  color: $text-color-soft;
}
.ds-input-description {
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
