<template>
  <ds-flex
    :width="{ base: '100%' }"
    gutter="base"
  >
    <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
      <ds-card>
        <no-ssr>
          <hc-editor v-model="content" />
        </no-ssr>
        <div
          slot="footer"
          style="text-align: right"
        >
          <ds-button
            icon="check"
            primary
            @click="save"
          >
            Speichern
          </ds-button>
        </div>
      </ds-card>
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
      &nbsp;
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import gql from 'graphql-tag'
import HcEditor from '~/components/Editor/Editor.vue'

export default {
  components: {
    HcEditor
  },
  data() {
    return {
      content: ''
    }
  },
  watch: {
    Post: {
      immediate: true,
      handler: function(post) {
        console.log('try to set content', this.content, post)
        if (!post || !post[0].content) {
          return
        }
        console.log(post[0].content)
        this.content = post[0].content
      }
    }
  },
  methods: {
    save() {
      console.log(this.content)
    }
    //onUpdate(data) {
    //  console.log('onUpdate', data)
    //}
  },
  apollo: {
    Post: {
      query() {
        return gql(`
          query($id: ID!) {
            Post(id: $id) {
              id
              title
              content
              createdAt
              slug
              image
              tags {
                name
              }
              categories {
                id
                name
                icon
              }
            }
          }
        `)
      },
      variables() {
        return {
          id: this.$route.params.id || 'p1'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
