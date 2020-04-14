import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import SearchResults from './SearchResults'
import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import PostTeaser from '~/components/PostTeaser/PostTeaser'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import helpers from '~/storybook/helpers'
import faker from 'faker'
import { post } from '~/components/PostTeaser/PostTeaser.story.js'
import { user } from '~/components/UserTeaser/UserTeaser.story.js'

helpers.init()

const postMock = (fields) => {
  return {
    ...post,
    id: faker.random.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deleted: false,
    disabled: false,
    typename: 'Post',
    ...fields,
  }
}

const userMock = (fields) => {
  return {
    ...user,
    id: faker.random.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deleted: false,
    disabled: false,
    typename: 'User',
    ...fields,
  }
}

const posts = [
  postMock(),
  postMock({ author: user }),
  postMock({ title: faker.lorem.sentence() }),
  postMock({ contentExcerpt: faker.lorem.paragraph() }),
  postMock({ author: user }),
  postMock({ title: faker.lorem.sentence() }),
  postMock({ author: user }),
]

const users = [
  userMock(),
  userMock({ slug: 'louie-rider', name: 'Louie Rider' }),
  userMock({ slug: 'louicinda-johnson', name: 'Louicinda Jonhson' }),
  userMock({ slug: 'sam-louie', name: 'Sam Louie' }),
  userMock({ slug: 'loucette', name: 'Loucette Rider' }),
  userMock({ slug: 'louis', name: 'Louis' }),
  userMock({ slug: 'louanna', name: 'Louanna' }),
]

storiesOf('SearchResults', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('given users', () => ({
    components: { TabNavigation, PostTeaser, UserTeaser },
    store: helpers.store,
    data: () => ({
      searchResults: users,
      activeTab: 'users',
    }),
    computed: {
      posts() {
        return []
      },
      users() {
        return this.searchResults
      },
      activeResources() {
        if (this.activeTab === 'posts') return this.posts
        else if (this.activeTab === 'users') return this.users
      },
      tabOptions() {
        return [
          { type: 'posts', title: `0 Posts` },
          { type: 'users', title: `${users.length} Users` },
        ]
      },
    },
    template: `<div class="search-results">
                <tab-navigation
                  :tabs="tabOptions"
                  :activeTab="activeTab"
                  @switchTab="tab => activeTab = tab"
                />
                <section>
                  <ul v-if="activeResources.length">
                    <li v-for="resource in activeResources" :key="resource.key" class="list">
                      <post-teaser v-if="activeTab === 'posts'" :post="resource" />
                      <base-card v-else-if="activeTab === 'users'" :wideContent="true">
                        <user-teaser :user="resource" />
                      </base-card>
                    </li>
                  </ul>
                </section>
              </div>`,
  }))
  .add('given posts', () => ({
    components: { TabNavigation, PostTeaser, UserTeaser, SearchResults },
    store: helpers.store,
    data: () => ({
      searchResults: posts,
      activeTab: 'posts',
    }),
    computed: {
      posts() {
        return this.searchResults
      },
      users() {
        return []
      },
      activeResources() {
        if (this.activeTab === 'posts') return this.posts
        else if (this.activeTab === 'users') return this.users
      },
      tabOptions() {
        return [
          { type: 'posts', title: `${posts.length} Posts` },
          { type: 'users', title: `0 Users` },
        ]
      },
    },
    template: `<div class="search-results">
                <tab-navigation
                  :tabs="tabOptions"
                  :activeTab="activeTab"
                  @switchTab="tab => activeTab = tab"
                />
                <section>
                  <ul v-if="activeResources.length">
                    <li v-for="resource in activeResources" :key="resource.key" class="list">
                      <post-teaser v-if="activeTab === 'posts'" :post="resource" />
                      <base-card v-else-if="activeTab === 'users'" :wideContent="true">
                        <user-teaser :user="resource" />
                      </base-card>
                    </li>
                  </ul>
                </section>
              </div>`,
  }))
