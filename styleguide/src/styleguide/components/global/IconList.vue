<template>
  <ds-space margin-top="x-large">
    <ds-space>
      <ds-input
        v-model="searchString"
        icon="search"
        placeholder="Search icon ..."/>
    </ds-space>
    <ds-flex
      gutter="large"
      :width="{ base: '100%', xs: '50%', lg: '33.3332%'}">
      <ds-flex-item
        v-for="icon in filteredIcons"
        :key="icon">
        <ds-card>
          <div class="icon-preview">
            <ds-text size="x-large">
              <ds-icon :name="icon"/>
            </ds-text>
          </div>
          <ds-copy-field>{{ icon }}</ds-copy-field>
          <template slot="footer">
            <ds-button
              @click="copy(icon)"
              primary>Copy Code</ds-button>
          </template>
        </ds-card>
      </ds-flex-item>
    </ds-flex>
  </ds-space>
</template>

<script>
import { iconNames } from '@@/icons'

export default {
  name: 'IconList',
  data() {
    return {
      searchString: ''
    }
  },
  computed: {
    icons() {
      return iconNames
    },
    filteredIcons() {
      if (!this.searchString) {
        return this.icons
      }
      return this.icons.filter(icon => {
        return icon.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1
      })
    }
  },
  methods: {
    copy(icon) {
      const code = `<ds-icon name="${icon}" />`
      this.$copyToClipboard(code)
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-preview {
  height: 50px;
  text-align: center;
}
</style>
