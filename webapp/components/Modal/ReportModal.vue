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
    <ds-radio
      :model="form.reasonCategory"
      :label="$t('report.reason.category.label')"
      :options="form.reasonCategoryOptions"
      :placeholder="$t('report.reason.category.placeholder')"
    />
    <ds-input
      id="text"
      :label="$t('report.reason.addText.label')"
      :placeholder="$t('report.reason.addText.placeholder')"
    />
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
    return {
      isOpen: true,
      success: false,
      loading: false,
      failsValidations: true,
      form: {
        reasonCategory: null,
        reasonCategoryOptions: [
          this.$t('report.reason.category.options.discrimination-etc'),
          this.$t('report.reason.category.options.pornographic-content-links'),
          this.$t('report.reason.category.options.glorific-trivia-of-cruel-inhuman-acts'),
          this.$t('report.reason.category.options.doxing'),
          this.$t('report.reason.category.options.intentional-intimidation-stalking-persecution'),
          this.$t('report.reason.category.options.advert-products-services-commercial'),
          this.$t('report.reason.category.options.criminal-behavior-violation-german-law'),
          this.$t('report.reason.category.options.other'),
        ],
        reasonAddText: '',
      },
      formSchema: {
        reasonAddText: { required: true, min: 0, max: 200 },
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
      const { reasonCategory, reasonAddText } = this.form

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
