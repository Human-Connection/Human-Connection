<template>
  <div>
    <ds-page-title :heading="section.name" />
    <ds-container>
      <ds-space margin-top="x-large">
        <markdown
          :content="description"
          :components="requiredComponents"
          v-if="description"/>
      </ds-space>
      <ds-flex
        gutter="base"
        :width="{ base: '100%', sm: '50%' }">
        <component-item
          v-if="components"
          v-for="component in components"
          :key="component.name"
          :component="component" />
      </ds-flex>
    </ds-container>
  </div>
</template>

<script>
import ComponentItem from './ComponentItem'

export default {
  name: 'SectionPage',
  props: {
    section: {
      type: Object,
      required: true
    },
    components: {
      type: Array,
      default: null
    }
  },
  components: {
    ComponentItem
  },
  data() {
    return {
      description: null,
      requiredComponents: {}
    }
  },
  created() {
    const name = this.section.name.replace(' ', '')

    if (this.section.requiredComponents) {
      this.section.requiredComponents.forEach(component => {
        try {
          const cFile = require(`./${component}`).default
          this.requiredComponents[cFile.name] = cFile
        } catch (err) {
          // eslint-disable-next-line
          console.error('could not get required component', err)
        }
      })
    }

    try {
      const mdFile = require(`!raw-loader?modules!../docs/${name}.md`)
      this.description = mdFile
    } catch (err) {
      this.description = null
    }
  }
}
</script>
