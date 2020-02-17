<template>
  <article :class="{ '--read': notification.read, notification: true }">
    <client-only>
      <user-teaser :user="from.author" :date-time="from.createdAt" />
    </client-only>
    <p class="description">{{ $t(`notifications.reason.${notification.reason}`) }}</p>
    <nuxt-link
      class="link"
      :to="{ name: 'post-id-slug', params, ...hashParam }"
      @click.native="$emit('read')"
    >
      <base-card wideContent>
        <h2 class="title">{{ from.title || from.post.title }}</h2>
        <p>
          <strong v-if="isComment" class="comment">{{ $t(`notifications.comment`) }}:</strong>
          {{ from.contentExcerpt | removeHtml }}
        </p>
      </base-card>
    </nuxt-link>
  </article>
</template>

<script>
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  name: 'Notification',
  components: {
    UserTeaser,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  computed: {
    from() {
      return this.notification.from
    },
    isComment() {
      return this.from.__typename === 'Comment'
    },
    params() {
      const post = this.isComment ? this.from.post : this.from
      return {
        id: post.id,
        slug: post.slug,
      }
    },
    hashParam() {
      return this.isComment ? { hash: `#commentId-${this.from.id}` } : {}
    },
  },
}
</script>

<style lang="scss">
.notification {
  margin-bottom: $space-base;

  &:first-of-type {
    margin-top: $space-x-small;
  }

  &.--read {
    opacity: $opacity-disabled;
  }

  > .description {
    margin-bottom: $space-x-small;
  }

  > .link {
    display: block;
    color: $text-color-base;

    &:hover {
      color: $color-primary;
    }
  }

  .user-teaser {
    margin-bottom: $space-x-small;
  }

  .comment {
    font-weight: $font-weight-bold;
  }
}
</style>
