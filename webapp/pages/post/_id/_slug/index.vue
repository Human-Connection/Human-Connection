<template>
  <transition
    name="fade"
    appear
  >
    <ds-card
      v-if="post && ready"
      :image="post.image"
      :class="{'post-card': true, 'disabled-content': post.disabled}"
    >
      <ds-space margin-bottom="small" />
      <hc-user
        :user="post.author"
        :date-time="post.createdAt"
      />
      <no-ssr>
        <content-menu
          placement="bottom-end"
          resource-type="contribution"
          :resource="post"
          :is-owner="isAuthor(post.author.id)"
        />
      </no-ssr>
      <ds-space margin-bottom="small" />
      <ds-heading
        tag="h3"
        no-margin
      >
        {{ post.title }}
      </ds-heading>
      <ds-space margin-bottom="small" />
      <!-- Content -->
      <!-- eslint-disable vue/no-v-html -->
      <!-- TODO: replace editor content with tiptap render view -->
      <div
        class="content hc-editor-content"
        v-html="post.content"
      />
      <!-- eslint-enable vue/no-v-html -->
      <ds-space margin="xx-large" />
      <!-- Categories -->
      <div class="categories">
        <ds-space margin="xx-small" />
        <hc-category
          v-for="category in post.categories"
          :key="category.id"
          v-tooltip="{content: category.name, placement: 'top-start', delay: { show: 300 }}"
          :icon="category.icon"
          :name="category.name"
        />
      </div>
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <div
        v-if="post.tags && post.tags.length"
        class="tags"
      >
        <ds-space margin="xx-small" />
        <hc-tag
          v-for="tag in post.tags"
          :key="tag.id"
          :name="tag.name"
        />
      </div>
      <!-- Shout Button -->
      <hc-shout-button
        v-if="post.author"
        :disabled="isAuthor(post.author.id)"
        :count="post.shoutedCount"
        :is-shouted="post.shoutedByCurrentUser"
        :post-id="post.id"
      />
      <!-- Categories -->
      <ds-icon
        v-for="category in post.categories"
        :key="category.id"
        v-tooltip="{content: category.name, placement: 'top-start', delay: { show: 300 }}"
        :name="category.icon"
        size="large"
      />&nbsp;
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <template v-if="post.tags && post.tags.length">
        <ds-space margin="xx-small" />
        <div class="tags">
          <ds-icon name="tags" />
          <ds-tag
            v-for="tag in post.tags"
            :key="tag.id"
          >
            <ds-icon name="tag" />
            {{ tag.name }}
          </ds-tag>
        </div>
      </template>
      <ds-space margin="small" />
      <!-- Comments -->
      <ds-section slot="footer">
        <ds-flex>
          <ds-flex-item width="20%">
            <h3 style="margin-top: 0;">
              <span>
                <ds-icon name="comments" />
                <ds-tag
                  v-if="post.comments"
                  style="margin-top: -4px; margin-left: -12px; position: absolute;"
                  color="primary"
                  size="small"
                  round
                >{{ post.commentsCount }}</ds-tag>&nbsp; Comments
              </span>
            </h3>
          </ds-flex-item>
          <ds-flex-item width="80%">
            <ds-form
              ref="commentForm"
              v-model="form"
              :schema="formSchema"
              @submit="handleSubmit"
            >
              <template slot-scope="{ errors }">
                <ds-card>
                  <no-ssr>
                    <hc-editor
                      :value="form.content"
                      @input="updateEditorContent"
                    />
                  </no-ssr>
                  <ds-space />
                  <ds-flex>
                    <ds-flex-item width="50%"/>
                    <ds-flex-item width="20%">
                      <ds-button
                        :disabled="loading || disabled"
                        ghost
                        @click.prevent="clearEditor"
                      >
                        {{ $t('actions.cancel') }}
                      </ds-button>
                    </ds-flex-item>
                    <ds-flex-item width="20%">
                      <ds-button
                        type="submit"
                        :loading="loading"
                        :disabled="disabled || errors"
                        primary
                      >
                        {{ $t('post.submitComment') }}
                      </ds-button>
                    </ds-flex-item>
                  </ds-flex>
                </ds-card>
              </template>
            </ds-form>
          </ds-flex-item>
        </ds-flex>
        <ds-space margin-bottom="large" />
        <div
          v-if="post.comments"
          id="comments"
          class="comments"
        >
          <comment
            v-for="comment in post.comments"
            :key="comment.id"
            :comment="comment"
          />
        </div>
        <hc-empty
          v-else
          icon="messages"
        />
      </ds-section>
    </ds-card>
  </transition>
</template>

<script>
import gql from 'graphql-tag'

import HcCategory from '~/components/Category'
import HcTag from '~/components/Tag'
import ContentMenu from '~/components/ContentMenu'
import HcUser from '~/components/User'
import HcShoutButton from '~/components/ShoutButton.vue'
import HcEmpty from '~/components/Empty.vue'
import Comment from '~/components/Comment.vue'
import HcEditor from '~/components/Editor'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  components: {
    HcTag,
    HcCategory,
    HcUser,
    HcShoutButton,
    HcEmpty,
    Comment,
    ContentMenu,
    HcEditor
  },
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      post: null,
      ready: false,
      title: 'loading',
      loading: false,
      disabled: false,
      form: {
        content: ''
      },
      formSchema: {
        content: { required: true, min: 3 }
      }
    }
  },
  watch: {
    Post(post) {
      this.post = post[0] || {}
      this.title = this.post.title
    }
  },
  mounted() {
    setTimeout(() => {
      // NOTE: quick fix for jumping flexbox implementation
      // will be fixed in a future update of the styleguide
      this.ready = true
    }, 50)
  },
  methods: {
    isAuthor(id) {
      return this.$store.getters['auth/user'].id === id
    },
    updateEditorContent(value) {
      this.$refs.commentForm.update('content', value)
    },
    clearEditor() {
      this.loading = false
      this.disabled = false
      this.form.content = ' '
    },
    addComment(comment) {
      this.$apollo.queries.Post.refetch()
      // this.post = { ...this.post, comments: [...this.post.comments, comment] }
    },
    handleSubmit() {
      const content = this.form.content
      this.form.content = ' '
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($postId: ID, $content: String!) {
              CreateComment(postId: $postId, content: $content) {
                id
                content
              }
            }
          `,
          variables: {
            postId: this.post.id,
            content
          }
        })
        .then(res => {
          this.addComment(res.data.CreateComment)
          this.loading = false
          this.disabled = false
          this.$toast.success(this.$t('post.commentSubmitted'))
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.loading = false
          this.disabled = false
        })
    }
  },
  apollo: {
    Post: {
      query() {
        return require('~/graphql/PostQuery.js').default(this)
      },
      variables() {
        return {
          slug: this.$route.params.slug
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>

<style lang="scss">
.page-name-post-id-slug {
  .content-menu {
    float: right;
    margin-right: -$space-x-small;
    margin-top: -$space-large;
  }

  .post-card {
    // max-width: 800px;
    margin: auto;

    .comments {
      margin-top: $space-small;

      .comment {
        margin-top: $space-small;
        position: relative;
      }
    }

    .ds-card-image {
      img {
        max-height: 300px;
        object-fit: cover;
        object-position: center;
      }
    }

    .ds-card-footer {
      padding: 0;

      .ds-section {
        padding: $space-base;
      }
    }
  }
}
</style>
