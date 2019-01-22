<template>
  <div>
    <ds-card>
      <no-ssr>
        <hc-editor />
      </no-ssr>
    </ds-card>
  </div>
</template>

<script>
import HcEditor from '~/components/Editor/Editor.vue'

export default {
  components: {
    HcEditor
  }
}
</script>
