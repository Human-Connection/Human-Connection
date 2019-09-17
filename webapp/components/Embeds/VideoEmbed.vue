<template>
  <div class="video-embed">
    <div class="video-embed-wrapper" v-if="embedUrl">
      <div v-if="!renderEmbed" class="video-embed-preview" @click="renderEmbed = true">
        <img :src="embedData.image" />
        <div class="player-icon">
          <ds-icon name="youtube-play" size="xxx-large" />
        </div>
      </div>
      <iframe
        v-else
        :src="url"
        frameborder="0"
        webkitallowfullscreen
        mozallowfullscreen
        allowfullscreen
      ></iframe>
    </div>
    <default-embed v-else :previewImage="embedData.image" :url="url" />
  </div>
</template>

<script>
import DefaultEmbed from './DefaultEmbed.vue'

export default {
  name: 'video-embed',
  components: {
    DefaultEmbed,
  },
  props: {
    url: {
      type: String,
      default: '',
    },
    embedData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      renderEmbed: false,
    }
  },
  computed: {
    embedUrl() {
      if (this.embedData.publisher === 'YouTube') {
        const videoUrl = this.embedData.url.split('watch?v=')[1]
        return `https://www.youtube.com/embed/${videoUrl}?feature=oembed`
      }
      if (this.embedData.publisher === 'Vimeo') {
        const url = new URL(this.embedData.url)
        const protocol = url.protocol
        const hostname = url.hostname
        const videoId = url.pathname
        return `${protocol}//player.${hostname}/video${videoId}`
      }
      return false
    },
  },
}
</script>

<style lang="scss">
.video-embed-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56%;

  iframe,
  .video-embed-preview {
    position: absolute;
    top: 0;
    left: 0;
    border: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .video-embed-preview {
    cursor: pointer;
    overflow: hidden;

    img {
      object-fit: cover;
      width: 100%;
    }

    .player-icon {
      & > .ds-icon {
        width: 80px;
        height: 80px;
      }
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
}
</style>
