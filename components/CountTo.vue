<script>
import CountTo from 'vue-count-to'
export default {
  extends: CountTo,
  props: {
    startVal: { type: Number, default: 0 },
    endVal: { type: Number, required: true },
    duration: { type: Number, default: 3000 },
    autoplay: { type: Boolean, default: true },
    separator: { type: String, default: '.' }
  }
}
</script>
