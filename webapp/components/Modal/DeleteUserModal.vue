<template>
  <ds-modal :title="title" :is-open="isOpen" @cancel="cancel">
    <transition name="ds-transition-fade">
      <ds-flex v-if="success" class="hc-modal-success" centered>
        <sweetalert-icon icon="success" />
      </ds-flex>
    </transition>
    <div>
      <ds-section>
        <ds-heading>{{ userdata.name }}</ds-heading>
        <ds-placeholder>
          <div>
            <ds-avatar :name="userdata.name" :image="userdata.avatar" size="x-large" />
          </div>
          <br />
          <ds-text>
            Slug:
            <ds-text size="x-large">{{ userdata.slug }}</ds-text>
          </ds-text>
          <ds-text>
            Id:
            <ds-text size="x-large">{{ userdata.id }}</ds-text>
          </ds-text>
          <ds-text>
            contributionsCount:
            <ds-text size="x-large">{{ userdata.contributionsCount }}</ds-text>
          </ds-text>
          <ds-text>
            commentedCount:
            <ds-text size="x-large">{{ userdata.commentedCount }}</ds-text>
          </ds-text>
          <ds-text>
            createdAt:
            <ds-text size="x-large">{{ userdata.createdAt }}</ds-text>
          </ds-text>
        </ds-placeholder>
      </ds-section>
    </div>

    <template slot="footer">
      <base-button class="cancel" @click="cancel">{{ $t('actions.cancel') }}</base-button>
      <base-button danger filled class="confirm" icon="exclamation-circle" @click="openModal">
        {{ $t('settings.deleteUserAccount.name') }}
      </base-button>
    </template>
  </ds-modal>
</template>

<script>
import gql from 'graphql-tag'
import { mapMutations } from 'vuex'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  name: 'DeleteUserModal',
  components: {
    SweetalertIcon,
  },
  props: {
    userdata: { type: Object, required: true },
  },
  data() {
    return {
      isOpen: true,
      success: false,
      loading: false,
      isAdmin: this.$store.getters['auth/isAdmin'],
    }
  },
  computed: {
    title() {
      return this.$t('settings.deleteUserAccount.name')
    },

    modalData(userdata) {
      return function(userdata) {
        return {
          name: 'confirm',
          data: {
            type: userdata.name,
            resource: userdata,
            modalData: {
              titleIdent: this.$t('settings.deleteUserAccount.accountWarningIsAdmin'),
              messageIdent: this.$t('settings.deleteUserAccount.infoAdmin'),
              messageParams: {},
              buttons: {
                confirm: {
                  danger: true,
                  icon: 'trash',
                  textIdent: this.$t('settings.deleteUserAccount.confirmDeleting'),
                  callback: () => {
                    this.confirm(userdata)
                  },
                },
                cancel: {
                  icon: 'close',
                  textIdent: this.$t('actions.cancel'),
                  callback: () => {},
                },
              },
            },
          },
        }
      }
    },
  },
  methods: {
    ...mapMutations({
      commitModalData: 'modal/SET_OPEN',
    }),
    openModal() {
      this.commitModalData(this.modalData(this.userdata))
    },
    cancel() {
      // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
      // await this.modalData.buttons.cancel.callback()
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $resource: [Deletable]) {
              DeleteUser(id: $id, resource: $resource) {
                id
              }
            }
          `,
          variables: { id: this.userdata.id, resource: ['Post', 'Comment'] },
        })
        .then(({ _data }) => {
          this.success = true
          this.$toast.success(this.$t('settings.deleteUserAccount.success'))
          setTimeout(() => {
            this.isOpen = false
            setTimeout(() => {
              this.success = false
              this.$emit('close')
              this.$router.history.push('/')
            }, 500)
          }, 1500)
          this.loading = false
        })
        .catch(err => {
          this.$emit('close')
          this.success = false
          this.$toast.error(err.message)
          this.isOpen = false
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
