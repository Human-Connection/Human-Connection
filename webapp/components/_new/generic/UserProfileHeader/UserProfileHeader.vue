<template>
  <div class="profile-header" :style="headerStyles">
    <vue-dropzone
      v-if="user && this.editable"
      id="profileHeaderDropzone"
      :key="profileHeaderUrl"
      ref="el"
      :use-custom-slot="true"
      :options="dropzoneOptions"
      @vdropzone-error="verror"
    >
      <div class="dz-message" @mouseover="hover = true" @mouseleave="hover = false">
        <img
          v-if="user && user.profileHeader"
          :src="user.profileHeader | proxyApiUrl"
          @error="$event.target.style.display = 'none'"
          class="profile-header-image"
          :alt="imageAlt"
        />
        <div class="profileHeader-attachments-upload-area">
          <div class="profileHeader-drag-marker">
            <base-icon v-if="hover" name="image" />
          </div>
        </div>
      </div>
    </vue-dropzone>
    <div v-else>
      <img
        v-if="user && user.profileHeader"
        :src="user.profileHeader | proxyApiUrl"
        @error="$event.target.style.display = 'none'"
        class="profile-header-image"
        :alt="imageAlt"
      />
    </div>
  </div>
</template>

<script>
import vueDropzone from 'nuxt-dropzone'
import { updateUserMutation } from '~/graphql/User.js'

export default {
  name: 'UserProfileHeader',
  components: {
    vueDropzone,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dropzoneOptions: {
        url: this.vddrop,
        maxFilesize: 5.0,
        previewTemplate: this.template(),
      },
      error: false,
      hover: false,
    }
  },
  computed: {
    imageAlt() {
      if (!this.user && !this.user.name) return 'Profile header image'
      return 'Profile header image of ' + this.user.name
    },
    profileHeaderUrl() {
      if (this.user == null || this.user.profileHeader == null) return false
      const { profileHeader } = this.user
      return profileHeader && profileHeader.url
    },
    headerStyles() {
      /*  Allow the header to shrink when a profileHeaderUrl is present,
          this prevents a grey bar from showing up on mobile.
      */
      if (this.profileHeaderUrl) {
        return {
          // Still setting some height in case the user uploads a super super wide picture.
          // In that case the height would, in theory, be able to go to 0 thus changing a profile
          // picture won't be possible anymore.
          '--min-height': 20 + 'px',
          '--max-height': 250 + 'px',
        }
      } else {
        // If no picture is present, the height is fixed to 250 so user can click the upload zone.
        return {
          '--height': 250 + 'px',
        }
      }
    },
  },
  watch: {
    error() {
      const that = this
      setTimeout(function () {
        that.error = false
      }, 2000)
    },
  },
  methods: {
    template() {
      return `<div class="dz-preview dz-file-preview">
                <div class="dz-image">
                  <div data-dz-thumbnail-bg></div>
                </div>
              </div>
      `
    },
    vddrop(file) {
      const profileHeaderUpload = file[0]
      this.$apollo
        .mutate({
          mutation: updateUserMutation(),
          variables: {
            profileHeader: {
              upload: profileHeaderUpload,
            },
            id: this.user.id,
          },
        })
        .then(() => {
          this.$toast.success(this.$t('user.profileHeader.submitted'))
        })
        .catch((error) => this.$toast.error(error.message))
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
.profile-header {
  min-height: var(--min-height);
  max-height: var(--max-height);
  height: var(--height);
  background-color: DarkGrey; /* Fallback color */
}

.profile-header-image {
  width: 100%;
}

#profileHeaderDropzone {
  height: 100%;
}

.dz-message {
  height: 100%;
}

#profileHeaderDropzone .dz-preview {
  transition: all 0.2s ease-out;
  width: 160px;
  display: flex;
}

#profileHeaderDropzone .dz-preview .dz-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  overflow: hidden;
}

#profileHeaderDropzone .dz-preview .dz-image > div {
  width: inherit;
  height: inherit;
  border-radius: 50%;
  background-size: cover;
}

#profileHeaderDropzone .dz-preview .dz-image > img {
  width: 100%;
}

.profileHeader-attachments-upload-area {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profileHeader-attachments-upload-button {
  pointer-events: none;
}

.profileHeader-drag-marker {
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

  background-color: rgba(255, 255, 255, 0.7);
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
  .profileHeader-attachments-upload-area:hover & {
    opacity: 1;
  }
}
</style>
