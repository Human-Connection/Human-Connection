<template>
  <div :key="error">
    <vue-dropzone
      id="customdropzone"
      :key="user.avatar"
      ref="el"
      :use-custom-slot="true"
      :options="dropzoneOptions"
      @vdropzone-error="verror"
    >
      <div class="dz-message" @mouseover="hover = true" @mouseleave="hover = false">
        <hc-avatar :user="user" class="profile-avatar" size="x-large"></hc-avatar>
        <div class="hc-attachments-upload-area">
          <div class="hc-drag-marker">
            <ds-icon v-if="hover" name="image" size="xxx-large" />
          </div>
        </div>
      </div>
    </vue-dropzone>
  </div>
</template>
<script>
import vueDropzone from 'nuxt-dropzone'
import gql from 'graphql-tag'
import HcAvatar from '~/components/Avatar/Avatar.vue'

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
      },
      error: false,
      hover: false,
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

.hc-attachments-upload-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hc-attachments-upload-button {
  pointer-events: none;
}

.hc-drag-marker {
  position: relative;
  width: 122px;
  height: 122px;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(0, 0%, 25%);
  transition: all 0.2s ease-out;
  font-size: 60px;
  margin: -120px auto 5px;

  background-color: rgba(255, 255, 255, 0.3);
  opacity: 0.1;

  &:before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 100%;
    border: 20px solid rgba(255, 255, 255, 0.4);
    visibility: hidden;
  }

  &:after {
    position: absolute;
    content: '';
    top: 10px;
    left: 10px;
    bottom: 10px;
    right: 10px;
    border-radius: 100%;
    border: 1px dashed hsl(0, 0%, 25%);
  }

  .hc-attachments-upload-area:hover & {
    opacity: 1;
  }
}
</style>
