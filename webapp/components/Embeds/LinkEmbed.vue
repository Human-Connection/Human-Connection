<template>
  <div class="link-embed">
    <a :href="embedData.url" target="_blank" class="embed-link">
      <ds-flex>
        <ds-flex-item v-if="description" :class="{ 'has-title': title }" width="45%">
          <ds-flex-item v-if="title" class="embed-title-inner">{{ title }}</ds-flex-item>
          <ds-flex-item class="embed-description-inner">{{ description }}</ds-flex-item>
        </ds-flex-item>
        <ds-flex-item width="5%" />
        <ds-flex-item class="embed-image" width="50%">
          <source-image :embedData="embedData" />
        </ds-flex-item>
      </ds-flex>
    </a>
  </div>
</template>

<script>
import SourceImage from './SourceImage.vue'
import { truncate } from 'lodash'

export default {
  name: 'link-embed',
  components: {
    SourceImage,
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
  computed: {
    title() {
      const title = this.embedData.title
      if (title && title !== this.description) {
        return title
      }
      return null
    },
    description() {
      let description = this.embedData.description || this.embedData.title
      if (!description) {
        return null
      }
      return truncate(description, { length: 256 })
    },
  },
}
</script>

<style lang="scss">
.link-embed {
  .embed-link,
  .embed-link:link,
  .embed-link:hover {
    color: gray;
    text-decoration: none;
  }

  .embed-title-inner {
    font-weight: bold;
    font-size: 1.1em;
    padding-bottom: 0.5em;
    display: block;
  }

  .embed-description-inner {
    max-height: 115px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 7;
    -webkit-box-orient: vertical;
  }

  .has-title {
    .embed-description-inner {
      max-height: 85px;
      -webkit-line-clamp: 4;
    }
  }

  .embed-image {
    padding: 15px;
    background-color: #ccc;
  }
}
</style>
