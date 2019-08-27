<template>
  <span>
    <client-only placeholder="0" tag="span">
      <count-to
        :start-val="startVal"
        :end-val="endVal"
        :duration="duration"
        :autoplay="autoplay"
        :separator="separator"
      />
    </client-only>
  </span>
</template>

<script>
import CountTo from 'vue-count-to'
export default {
  components: {
    CountTo,
  },
  props: {
    startVal: { type: Number, default: 0 },
    endVal: { type: Number, default: 0 },
    duration: { type: Number, default: 3000 },
    autoplay: { type: Boolean, default: true },
    separator: { type: String, default: '.' },
  },
}
</script>
