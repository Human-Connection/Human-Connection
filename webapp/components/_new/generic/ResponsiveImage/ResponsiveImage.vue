<template>
  <img
    :srcset="srcSet"
    :sizes="sizes"
    :src="proxyApiUrl(image.url)"
    :alt="image.alt"
    @error="$event.target.style.display = 'none'"
  />
</template>
<script>
export default {
  props: {
    image: { type: Object, required: true },
    sizes: { type: String, default: () => null },
  },
  computed: {
    srcSet() {
      const widths = Object.keys(this.image).filter((key) => key.startsWith('w'))
      return widths
        .map((width) => `${this.proxyApiUrl(this.image[width])} ${width.substring(1)}w`)
        .join(', ')
    },
  },
  methods: {
    proxyApiUrl: (input) => {
      const url = input && (input.url || input)
      if (!url) return url
      return url.startsWith('/') ? url.replace('/', '/api/') : url
    },
  },
}
</script>
