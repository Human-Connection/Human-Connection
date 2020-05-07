<template>
  <div id="search-results" class="search-results">
    <div>
      <ds-section>
        <ds-text class="search-results">
          <strong>{{ searchCount }}</strong>
          {{ $t('search.results', {}, searchCount) }}
        </ds-text>
      </ds-section>
    </div>

    <tab-navigation :tabs="tabOptions" :activeTab="activeTab" @switchTab="switchTab" />
    <section
      :class="['results', activeTab === 'User' && '--user', !activeResourceCount > 0 && '--empty']"
    >
      <hc-empty
        v-if="!activeResourceCount || searchCount === 0"
        icon="tasks"
        :message="$t('search.no-results', { search })"
      />
      <template  >
        <pagination-buttons
          v-show="resultsCount > pageSize"
          :hasMoreResults="hasMoreResults"
          :hasPreviousResult="hasPreviousResult"
          :activePage="resultsPage"
          :totalResultCount="resultsCount"
          :resultPages="resultPages"
          @back="previousResults"
          @next="nextResults"
        />
        <masonry-grid v-show="activeTab === 'Post'">
          <masonry-grid-item v-for="resource in activeResources" :key="resource.key">
            <post-teaser :post="resource" />
          </masonry-grid-item>
        </masonry-grid>


        <ul v-show="activeTab === 'User'" class="user-list">
       
        <li v-for="resource in activeResources" :key="resource.key" class="item">
          <base-card :wideContent="true">
            <user-teaser :user="resource" />
          </base-card>
        </li>
      
      </ul>
      <ul v-show="activeTab === 'Hashtag'" class="hashtag-list">
         
        <li v-for="resource in activeResources" :key="resource.key" class="item">
          <base-card :wideContent="true">
            <hc-hashtag :id="resource.id" />
          </base-card>
        </li>
        
      </ul>

        <pagination-buttons
          v-show="resultsCount > pageSize"
          :hasMoreResults="hasMoreResults"
          :hasPreviousResult="hasPreviousResult"
          :activePage="resultsPage"
          :totalResultCount="resultsCount"
          @back="previousResults"
          @next="nextResults"
        />
      </template>
     
    </section>
  </div>
</template>

<script>
import { searchPosts, searchUsers, searchHashtags } from '~/graphql/Search.js'
import HcEmpty from '~/components/Empty/Empty'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem'
import PostTeaser from '~/components/PostTeaser/PostTeaser'
import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'
import HcHashtag from '~/components/Hashtag/Hashtag'

export default {
  components: {
    TabNavigation,
    HcEmpty,
    MasonryGrid,
    MasonryGridItem,
    PostTeaser,
    PaginationButtons,
    UserTeaser,
    HcHashtag,
  },
  props: {
    search: {
      type: String,
    },
    pageSize: {
      type: Number,
      default: 24
    },
  },
  data() {
    return {
      posts: [],
      users: [],
      hashtags: [],

      resultsPage: 0,
      resultsCount: 0,

      postCount: 0,

      userCount: 0,
      userPage: 0,

      hashtagCount: 0,
      hashtagPage: 0,

      activeTab: null,
      resultPages: 1,
      activeResultPage: 1,

      firstPosts: this.pageSize,
      firstUsers: this.pageSize,
      firstHashtags: this.pageSize,

      postsOffset: 0,
      usersOffset: 0,
      hashtagsOffset: 0,

      hasPagination: false,
    }
  },
  computed: {
    activeResources() {
      console.log("activeResources()")
      if (this.activeTab === 'Post') return this.posts
      else if (this.activeTab === 'User') return this.users
      else if (this.activeTab === 'Hashtag') return this.hashtags
      else return []
    },
    activeResourceCount() {
      console.log("activeResourceCount()")
      if (this.activeTab === 'Post') return this.postCount
      else if (this.activeTab === 'User') return this.userCount
      else if (this.activeTab === 'Hashtag') return this.hashtagCount
      else return []
    },
    tabOptions() {
      return [
        {
          type: 'Post',
          title: `${this.postCount} ${this.$t('search.heading.Post', {}, this.postCount)}`,
          disabled: this.postCount === 0,
        },
        {
          type: 'User',
          title: `${this.userCount} ${this.$t('search.heading.User')}`,
          disabled: this.userCount === 0,
        },
        {
          type: 'Hashtag',
          title: `${this.hashtagCount} ${this.$t('search.heading.Tag', {}, this.hashtagCount)}`,
          disabled: this.hashtagCount === 0,
        },
      ]
    },
    hasPreviousResult(){
       console.log("hasPreviousResult()")
          if (this.activeTab === 'Post') return this.postsOffset > 0
      else if (this.activeTab === 'User') return this.usersOffset > 0
      else if (this.activeTab === 'Hashtag') return this.hashtagsOffset > 0
      else return []
    },
     hasMoreResults() {
      console.log("hasMoreResults()")
       if (this.activeTab === 'Post') return this.postsOffset < this.resultsCount
      else if (this.activeTab === 'User') return this.usersOffset  < this.resultsCount
      else if (this.activeTab === 'Hashtag') return  this.hashtagsOffset  < this.resultsCount
      else return []
     },
   
    searchCount() {
      return this.postCount + this.userCount + this.hashtagCount
    },
  },
  methods: {
    clearPage() {
      this.resultsPage = 0
  
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    previousResults() {
      console.log("previousResults()")
        if (this.activeTab === 'Post') {
         
           this.resultsPage = this.postPage - 1
           this.postsOffset - this.pageSize
           
        }
      else if (this.activeTab === 'User') {
        this.resultsPage =  this.userPage - 1
        this.usersOffset - this.pageSize
      }
      else if (this.activeTab === 'Hashtag') {
        this.resultsPage  = this.hashtagPage - 1
        this.hashtagsOffset -  this.pageSize
      }
      else return []
     
    },
     nextResults() {
      console.log("nextResults()")
       if (this.activeTab === 'Post') {
          this.resultsPage  = parseInt(this.postPage) + 1
           this.postsOffset + this.pageSize
        }
      else if (this.activeTab === 'User') {
        this.resultsPage  =  this.userPage + 1
        this.usersOffset + this.pageSize
       }
      else if (this.activeTab === 'Hashtag') {
        this.resultsPage  = this.hashtagPage + 1
         this.hashtagsOffset + this.pageSize
       }
      else return []
      
    },
  },
  apollo: {
   searchHashtags: {
      query() {
        return searchHashtags
      },
      variables() {
        const { firstHashtags, hashtagsOffset, search } = this
        return {
          query: search,
          firstHashtags,
          hashtagsOffset,
        }
      },
      skip() {
        return !this.search
      },
      update({ searchHashtags }) {
         console.log(" update({ searchHashtags }")
        this.hashtags = searchHashtags.hashtags
        this.resultsCount  = searchHashtags.hashtagCount
        this.hashtagCount  = searchHashtags.hashtagCount
         if (this.resultsCount > this.pageSize) this.hasPagination = true
        if (this.postCount === 0 && this.userCount === 0 && this.hashtagCount > 0)
          this.activeTab = 'Hashtag'
      },
      fetchPolicy: 'cache-and-network',
    },
    searchUsers: {
      query() {
        return searchUsers
      },
      variables() {
        const { firstUsers, usersOffset, search } = this
        return {
          query: search,
          firstUsers,
          usersOffset,
        }
      },
      skip() {
        return !this.search
      },
      update({ searchUsers }) {
         console.log(" update({ searchUsers }")
        this.users = searchUsers.users
        this.resultsCount  = searchUsers.userCount
        this.userCount  = searchUsers.userCount
        if (this.resultsCount > this.pageSize) this.hasPagination = true
        if (this.resultsCount === 0 && this.userCount > 0) this.activeTab = 'User'
      },
      fetchPolicy: 'cache-and-network',
    },
      searchPosts: {
      query() {
        return searchPosts
      },
      variables() {

        const { firstPosts, postsOffset, search } = this
        console.log("firstPosts",firstPosts)
        console.log("postsOffset",postsOffset)
        return {
          query: search,
          firstPosts,
          postsOffset,
        }
      
      },
      skip() {
        return !this.search
      },
      update({ searchPosts }) {
        console.log(" update({ searchPosts }")
        this.posts = searchPosts.posts
         this.postCount = searchPosts.postCount
        this.resultsCount = this.postCount
        if (this.resultsCount > this.pageSize) this.hasPagination = true
        if (this.postCount > 0) this.activeTab = 'Post'
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.search-results {
  > .results {
    /* display: inline-block;*/
    padding: $space-small;
    background-color: $color-neutral-80;
    border-radius: 0 $border-radius-base $border-radius-base $border-radius-base;

    &.--user {
      width: 100%;
      max-width: 600px;
    }

    &.--empty {
      width: 100%;
      max-width: 600px;
      background-color: transparent;
      border: $border-size-base solid $color-neutral-80;
    }
  }

  .user-list > .item {
    transition: opacity 0.1s;

    &:not(:last-child) {
      margin-bottom: $space-small;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
