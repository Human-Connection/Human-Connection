<template>
  <span class="embed-source-image">
    <img
      :src="embedData.image"
      @error="hasError = true"
      v-if="embedData.image && embedData.image && !hasError"
    />
    <span v-else>
      <svg viewBox="0 0 80 80" version="1.1">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <path
            d="M8,8 L36,8 L36,0 L8,0 C3.6,0 0,3.6 0,8 L0,36 L8,36 L8,8 L8,8 Z M32,44 L16,64 L64,64 L52,48 L43.88,58.84 L32,44 L32,44 Z M60,26 C60,22.68 57.32,20 54,20 C50.68,20 48,22.68 48,26 C48,29.32 50.68,32 54,32 C57.32,32 60,29.32 60,26 L60,26 Z M72,0 L44,0 L44,8 L72,8 L72,36 L80,36 L80,8 C80,3.6 76.4,0 72,0 L72,0 Z M72,72 L44,72 L44,80 L72,80 C76.4,80 80,76.4 80,72 L80,44 L72,44 L72,72 L72,72 Z M8,44 L0,44 L0,72 C0,76.4 3.6,80 8,80 L36,80 L36,72 L8,72 L8,44 L8,44 Z"
            id="Shape"
            fill="currentcolor"
          ></path>
        </g>
      </svg>
    </span>
  </span>
</template>

<script>
export default {
  name: 'embed-source-image',
  props: {
    embedData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      hasError: false,
    }
  },
}
</script>

<style lang="scss">
.embed-source-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-height: 100%;
    width: auto;
    object-fit: contain;
    justify-self: end;
  }

  span {
    background-color: #fff;
    min-height: 100px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;

    svg {
      width: 60px;
      height: auto;
      color: #eee;
    }
  }
}
</style>
