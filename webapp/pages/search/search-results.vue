<template>
  <ds-container>
    <div>
      <ds-flex>
        <ds-flex-item>
          <ds-tag color="primary" size="x-large" round>{{ searchResults.length }}</ds-tag>
          Results for:
          <b>{{ value }}</b>
        </ds-flex-item>
        <ds-flex-item width="2">
          <ds-button
            @click="postOnly = !postOnly"
            :secondary="postOnly"
            size="x-large"
            align="right"
          >
            <ds-tag color="primary" size="x-large" round>{{ posts.length }}</ds-tag>
            Beiträge
          </ds-button>
          <ds-button
            @click="userOnly = !userOnly"
            :secondary="userOnly"
            size="x-large"
            align="right"
          >
            <ds-tag color="primary" size="x-large" round>{{ users.length }}</ds-tag>
            User
          </ds-button>
          <ds-button @click="closeSearch" size="x-large" icon="close" right>close</ds-button>
        </ds-flex-item>
      </ds-flex>
    </div>
    <ds-space />

    <ds-space v-if="searchResults.length === 0">no Result</ds-space>

    <!--
    <ds-space v-for="(posts) in posts" :key="posts.key" class="Post searchresults">
      <div v-show="postOnly">
        
          {{ posts }}
      </div>
    </ds-space>
-->
    <div>
      <ds-space />


    <ds-text size="x-large" v-show="userOnly">Menschen</ds-text>
    <ds-grid gap="x-small" v-show="userOnly">
      <ds-grid-item v-for="users in users" :key="users.key" class="User searchresults">
        <div>
          <ds-placeholder>
            <ds-avatar size="large" :title="users.name" :image="users.avatar" />
            {{ users.name }}
            <div>
              <ds-chip>Beiträge</ds-chip>
              <ds-chip>Kommentare</ds-chip>
            </div>
          </ds-placeholder>
        </div>
      </ds-grid-item>
    </ds-grid>
   <ds-space />
    <ds-space />
      <ds-text size="x-large" v-show="postOnly">Beiträge</ds-text>
      <ds-list ordered v-show="postOnly">
        <ds-list-item v-for="posts in posts" :key="posts.key" class="Post searchresults">
          <div>
            <b>{{ posts.title }}</b>

            <div v-html="posts.content"></div>
            <div>
              <ds-text size="small">
                <i>
                  {{ posts.author.name }}-
                  <hc-relative-date-time :date-time="posts.createdAt" />
                </i>
              </ds-text>
            </div>
            <div>
              <div class="categories">
                <ds-space margin="xx-small" />
                <hc-category
                  v-for="category in posts.categories"
                  :key="category.id"
                  :icon="category.icon"
                  :name="$t(`contribution.category.name.${category.slug}`)"
                />
                <!-- Post language -->
                <ds-tag v-if="posts.language" class="category-tag language">
                  <base-icon name="globe" />
                  {{ posts.language.toUpperCase() }}
                </ds-tag>
              </div>
            </div>
          </div>
        </ds-list-item>
      </ds-list>
    </div>
 

  </ds-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { findResourcesQuery } from '~/graphql/Search.js'
import HcRelativeDateTime from '~/components/RelativeDateTime'
import HcCategory from '~/components/Category'

export default {
  layout: 'default',
  head() {
    return {
      title: 'SearchResults',
    }
  },
  components: {
    HcRelativeDateTime,
    HcCategory,
  },
  data() {
    return {
      loading: true,
      value: '',

      pending: false,
      searchResults: [],
      users: [],
      posts: [],
      userOnly: true,
      postOnly: true,
    }
  },

  computed: {
    ...mapGetters({
      searchValue: 'search/searchValue',
      orderOptions: 'posts/orderOptions',
      sortingIcon: 'posts/orderIcon',
    }),
    sortingOptions() {
      return this.orderOptions(this)
    },
  },
  mounted() {
    this.value = this.$route.query.item
    this.query(this.value)
  },

  watch: {
    searchValue: function(val) {
      this.users = []
      this.posts = []
      this.value = val
      this.query(this.value)
    },
  },
  methods: {
    async query(value) {
      this.pending = true
      try {
        const {
          data: { findResources },
        } = await this.$apollo.query({
          query: findResourcesQuery,
          variables: {
            query: value,
          },
        })
        for (var i = 0; i < findResources.length; i++) {
          if (findResources[i].__typename === 'User') {
            this.users.push(findResources[i])
          }
          if (findResources[i].__typename === 'Post') {
            this.posts.push(findResources[i])
          }
        }
        // console.log('users', this.users)
        // console.log('posts', this.posts)
        this.searchResults = findResources
      } catch (error) {
        this.searchResults = []
      } finally {
        this.pending = false
      }
    },
    closeSearch() {
      this.$router.replace('/')
    },
  },
}
</script>

<style lang="scss"></style>
