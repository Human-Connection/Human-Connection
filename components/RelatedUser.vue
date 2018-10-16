<script>
import HcAuthor from '~/components/Author.vue'

let mouseEnterTimer = null
let mouseLeaveTimer = null

export default {
  name: 'HcRelatedUser',
  extends: HcAuthor,
  computed: {
    author() {
      return this.hasAuthor
        ? this.post
        : {
            name: 'Anonymus'
          }
    },
    hasAuthor() {
      return Boolean(this.post)
    }
  }
}
</script>
