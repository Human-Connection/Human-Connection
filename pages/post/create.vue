<template>
  <ds-flex
    :width="{ base: '100%' }"
    gutter="base"
  >
    <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
      <ds-card>
        <no-ssr>
          <hc-editor />
        </no-ssr>
      </ds-card>
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
      &nbsp;
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import HcEditor from '~/components/Editor/Editor.vue'

export default {
  components: {
    HcEditor
  }
}
</script>
