<template>
  <div id="search-results" class="search-results">
    <div>
      <ds-section>
        <ds-text class="search-results">
          <strong>{{ searchCount }}</strong>
          {{ $t('search.results') }}
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
      <template v-else-if="activeTab === 'Post'">
        <pagination-buttons
          v-show="postCount > pageSize"
          :hasNext="hasMorePosts"
          :hasPrevious="hasPreviousPosts"
          :activePage="postPage"
          :totalResultCount="postCount"
          @back="previousPosts"
          @next="nextPosts"
        />
        <masonry-grid>
          <masonry-grid-item v-for="resource in activeResources" :key="resource.key">
            <post-teaser :post="resource" />
          </masonry-grid-item>
        </masonry-grid>

        <pagination-buttons
          v-show="postCount > pageSize"
          :hasNext="hasMorePosts"
          :hasPrevious="hasPreviousPosts"
          :activePage="postPage"
          :totalResultCount="postCount"
          @back="previousPosts"
          @next="nextPosts"
        />
      </template>
      <ul v-else-if="activeTab === 'User'" class="user-list">
        <pagination-buttons
          v-show="userCount > pageSize"
          :hasNext="hasMoreUsers"
          :hasPrevious="hasPreviousUsers"
          :activePage="userPage"
          :totalResultCount="userCount"
          @back="previousUsers"
          @next="nextUsers"
        />
        <li v-for="resource in activeResources" :key="resource.key" class="item">
          <base-card :wideContent="true">
            <user-teaser :user="resource" />
          </base-card>
        </li>
        <pagination-buttons
          v-show="userCount > pageSize"
          :hasNext="hasMoreUsers"
          :hasPrevious="hasPreviousUsers"
          :activePage="userPage"
          :totalResultCount="userCount"
          @back="previousUsers"
          @next="nextUsers"
        />
      </ul>
      <ul v-else-if="activeTab === 'Hashtag'" class="hashtag-list">
        <pagination-buttons
          v-show="hashtagCount > pageSize"
          :hasNext="hasMoreHashtags"
          :hasPrevious="hasPreviousHashtags"
          :activePage="hashtagPage"
          :totalResultCount="hashtagCount"
          @back="previousHashtags"
          @next="nextHashtags"
        />
        <li v-for="resource in activeResources" :key="resource.key" class="item">
          <base-card :wideContent="true">
            <hc-hashtag :id="resource.id" />
          </base-card>
        </li>
        <pagination-buttons
          v-show="hashtagCount > pageSize"
          :hasNext="hasMoreHashtags"
          :hasPrevious="hasPreviousHashtags"
          :activePage="hashtagPage"
          :totalResultCount="hashtagCount"
          @back="previousHashtags"
          @next="nextHashtags"
        />
      </ul>
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
      postCount: 0,
      postPage: 0,
      userCount: 0,
      userPage: 0,
      hashtagCount: 0,
      hashtagPage: 0,
      activeTab: null,
      firstPosts: this.pageSize,
      firstUsers: this.pageSize,
      firstHashtags: this.pageSize,
      postsOffset: 0,
      usersOffset: 0,
      hashtagsOffset: 0,
    }
  },
  computed: {
    activeResources() {
      if (this.activeTab === 'Post') return this.posts
      else if (this.activeTab === 'User') return this.users
      else if (this.activeTab === 'Hashtag') return this.hashtags
      else return []
    },
    activeResourceCount() {
      if (this.activeTab === 'Post') return this.postCount
      else if (this.activeTab === 'User') return this.userCount
      else if (this.activeTab === 'Hashtag') return this.hashtagCount
      else return []
    },
    tabOptions() {
      return [
        {
          type: 'Post',
          title: `${this.postCount} ${this.$t('search.heading.Post')}`,
          disabled: this.postCount === 0,
        },
        {
          type: 'User',
          title: `${this.userCount} ${this.$t('search.heading.User')}`,
          disabled: this.userCount === 0,
        },
        {
          type: 'Hashtag',
          title: `${this.hashtagCount} ${this.$t('search.heading.Tag')}`,
          disabled: this.hashtagCount === 0,
        },
      ]
    },
    hasPreviousPosts() {
      return this.postsOffset > 0
    },
    hasPreviousUsers() {
      return this.usersOffset > 0
    },
    hasPreviousHashtags() {
      return this.hashtagsOffset > 0
    },
    hasMorePosts() {
      console.log("this.postPage",this.postPage)
      console.log("this.pageSize",this.pageSize)
      console.log("this.postCount",this.postCount)
      
      return (this.postPage + 1) * this.pageSize < this.postCount
    },
    hasMoreUsers() {
      return (this.userPage + 1) * this.pageSize < this.userCount
    },
    hasMoreHashtags() {
      return (this.hashtagPage + 1) * this.pageSize < this.hashtagCount
    },
    searchCount() {
      return this.postCount + this.userCount + this.hashtagCount
    },
  },
  methods: {
    clearPage() {
      this.postPage = 0
      this.userPage = 0
      this.hashtagPage = 0
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    previousPosts() {
      this.postPage--
      this.postsOffset = this.postPage * this.pageSize
    },
    nextPosts() {
      this.postsOffset += this.pageSize
      this.postPage++
    },
    previousUsers() {
      this.userPage--
      this.usersOffset = this.userPage * this.pageSize
    },
    nextUsers() {
      this.usersOffset += this.pageSize
      this.userPage++
    },
    previousHashtags() {
      this.hashtagPage--
      this.hashtagsOffset = this.hashtagPage * this.pageSize
    },
    nextHashtags() {
      this.hashtagsOffset += this.pageSize
      this.hashtagPage++
    },
  },
  apollo: {
    searchPosts: {
      query() {
        return searchPosts
      },
      variables() {
        const { firstPosts, postsOffset, search } = this
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
        this.posts = searchPosts.posts
        this.postCount = searchPosts.postCount
        this.clearPage()
        if (this.postCount > 0) this.activeTab = 'Post'
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
        this.users = searchUsers.users
        this.userCount = searchUsers.userCount
        this.clearPage()
        if (this.postCount === 0 && this.userCount > 0) this.activeTab = 'User'
      },
      fetchPolicy: 'cache-and-network',
    },
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
        this.hashtags = searchHashtags.hashtags
        this.hashtagCount = searchHashtags.hashtagCount
        this.clearPage()
        if (this.postCount === 0 && this.userCount === 0 && this.hashtagCount > 0)
          this.activeTab = 'Hashtag'
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
