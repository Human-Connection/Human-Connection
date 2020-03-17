<template>
  <ds-container>
       <base-button
        class="crop-cancel"
        icon="close"
        size="small"
        circle
        danger
        filled
        rigth
       @click="closeSearch"
      />
    <ds-section>
     
      <ds-heading>  <ds-tag color="primary" size="x-large" round>{{ searchResults.length }}</ds-tag>
          Results for:
          <b>{{ value }}</b></ds-heading>
      <ds-text>    <ds-button
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
          </ds-button></ds-text>
    </ds-section>
  <ds-space />
    <ds-space />
      <ds-section>
   
      
    <ds-text size="x-large" v-show="userOnly">Menschen</ds-text>
    <ds-space v-if="users.length === 0">no Result</ds-space>
    <ds-grid v-else gap="x-small" v-show="userOnly">
      <ds-grid-item v-for="users in users" :key="users.key" class="User searchresults">
       
          <ds-placeholder>
            <ds-avatar size="large" :title="users.name" :image="users.avatar" />
            {{ users.name }}
            <div>
              <ds-chip>Beiträge</ds-chip>
              <ds-chip>Kommentare</ds-chip>
            </div>
          </ds-placeholder>
       
      </ds-grid-item>
    </ds-grid>
      </ds-section>
     
   <ds-space />
    <ds-space />

      <ds-section>
     
      <ds-text size="x-large" v-show="postOnly">Beiträge</ds-text>
      <ds-space v-if="posts.length === 0">no Result</ds-space>
      <ds-list v-else ordered v-show="postOnly">
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
                <ds-tag v-if="posts.language" class="category-tag language">
                  <base-icon name="globe" />
                  {{ posts.language.toUpperCase() }}
                </ds-tag>
              </div>
            </div>
          </div>
        </ds-list-item>
      </ds-list>
     
      </ds-section>
     
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
    posts() {
      return this.searchResults.filter(result => result.__typename === 'Post')
    },
    users() {
      return this.searchResults.filter(result => result.__typename === 'User')
    },
  },
  mounted() {
    if (this.$route.query.item){
    this.value = this.$route.query.item
    this.query(this.value)
    } else {
      this.$router.replace('/')
    }
  },
  watch: {
    searchValue(value) {
      this.query(value)
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
            limit: 37,
          },
        })
        // console.log('users', this.users)
        // console.log('posts', this.posts)
        console.log("findResources",findResources)
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
 