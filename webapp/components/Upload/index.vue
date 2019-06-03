<template>
  <vue-dropzone
    id="customdropzone"
    :key="user.avatar"
    ref="el"
    :use-custom-slot="true"
    :options="dropzoneOptions"
    @vdropzone-error="verror"
  >
    <div class="dz-message">
      <hc-avatar :user="user" class="profile-avatar" size="x-large"/>
    </div>
  </vue-dropzone>
</template>
<script>
import vueDropzone from 'nuxt-dropzone'
import HcAvatar from '~/components/Avatar/Avatar.vue'
import gql from 'graphql-tag'

export default {
  components: {
    vueDropzone,
    HcAvatar,
  },
  props: {
    user: { type: Object, default: null },
  },
  data() {
    return {
      dropzoneOptions: {
        url: this.vddrop,
        maxFilesize: 5.0,
        dictDefaultMessage: '',
      },
      error: false,
    }
  },
  watch: {
    error() {
      let that = this
      setTimeout(function() {
        that.error = false
      }, 2000)
    },
  },
  methods: {
    vddrop(file) {
      const avatarUpload = file[0]
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $avatarUpload: Upload) {
              UpdateUser(id: $id, avatarUpload: $avatarUpload) {
                id
                avatar
              }
            }
          `,
          variables: {
            avatarUpload,
            id: this.user.id,
          },
        })
        .then(() => {
          this.$toast.success(this.$t('user.avatar.submitted'))
        })
        .catch(error => this.$toast.error(error.message))
    },
    verror(file, message) {
      if (file.status === 'error') {
        this.error = true
        this.$toast.error(file.status, message)
      }
    },
  },
}
</script>
<style lang="scss">
#customdropzone:hover {
  cursor: pointer;
}

#customdropzone .dz-preview {
  transition: all 0.2s ease-out;
  width: 160px;
  display: flex;
}

#customdropzone .dz-preview .dz-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  overflow: hidden;
}

#customdropzone .dz-preview .dz-image > div {
  width: inherit;
  height: inherit;
  border-radius: 50%;
  background-size: cover;
}

#customdropzone .dz-preview .dz-image > img {
  width: 100%;
}

#customdropzone .dz-preview .dz-details {
  color: white;
  transition: opacity 0.2s linear;
  text-align: center;
}
</style>
