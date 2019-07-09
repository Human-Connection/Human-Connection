<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <a slot="default" slot-scope="{ toggleMenu }" href="#" @click.prevent="toggleMenu()">
      <ds-icon style="margin: 5px 0px 0px 10px;" name="filter" size="large" />
      <ds-icon style="margin-left: 2px" size="xx-small" name="angle-down" />
    </a>
    <template slot="popover">
      <ds-container>
        <ds-space />
        <ds-flex :groupedCategories="chunk">
          <ds-flex-item
            :width="{ base: '100%', sm: '100%', md: '100%', lg: '20%' }"
            class="categories-list"
          >
            <ds-space margin-bottom="x-small" />
            <ds-flex id="filter-posts-header">
              <ds-heading tag="h4">{{ $t('filter-posts.header') }}</ds-heading>
              <ds-flex-item width="10%" />
              <ds-flex-item width="100%">
                <ds-button
                  icon="check"
                  @click.stop.prevent="toggleCategory()"
                  :primary="allCategories"
                />
                <ds-flex-item>
                  <label>{{ $t('filter-posts.all') }}</label>
                </ds-flex-item>
                <ds-space />
              </ds-flex-item>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[0]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[1]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex class="categories-list">
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[2]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[3]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[4]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[5]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[6]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }">
            <ds-flex v-for="category in chunk[7]" :key="category.id" class="categories-list">
              <ds-flex>
                <ds-flex-item width="100%">
                  <ds-button
                    :icon="category.icon"
                    :primary="isActive(category.id)"
                    @click.stop.prevent="toggleCategory(category.id)"
                  />
                  <ds-space margin-bottom="small" />
                </ds-flex-item>
                <ds-flex>
                  <ds-flex-item>
                    <label>{{ category.name }}</label>
                  </ds-flex-item>
                  <ds-space margin-bottom="xx-large" />
                </ds-flex>
              </ds-flex>
            </ds-flex>
          </ds-flex-item>
        </ds-flex>
      </ds-container>
    </template>
  </dropdown>
</template>
<script>
import Dropdown from '~/components/Dropdown'
import { filterPosts } from '~/graphql/PostQuery.js'
import { mapMutations } from 'vuex'

export default {
  components: {
    Dropdown,
  },
  props: {
    placement: { type: String, default: 'bottom-start' },
    offset: { type: [String, Number], default: '16' },
    categories: { type: Array, default: () => [] },
  },
  data() {
    return {
      pageSize: 12,
      selectedCategoryIds: [],
      allCategories: true,
    }
  },
  computed: {
    chunk() {
      const groupedCategories = []
      for (let i = 0; i < this.categories.length; i++) {
        const last = groupedCategories[groupedCategories.length - 1]
        if (!last || last.length === 2) {
          groupedCategories.push([this.categories[i]])
        } else {
          last.push(this.categories[i])
        }
      }
      return groupedCategories
    },
  },
  methods: {
    ...mapMutations({
      setPosts: 'posts/SET_POSTS',
    }),
    filterPosts(categoryIds) {
      const filter = categoryIds.length
        ? { categories_in: { id_in: this.selectedCategoryIds } }
        : {}
      filter.categories_in ? (this.allCategories = false) : (this.allCategories = true)
      this.$apollo
        .query({
          query: filterPosts(this.$i18n),
          variables: {
            filter: filter,
            first: this.pageSize,
            offset: 0,
          },
        })
        .then(({ data: { Post } }) => {
          this.setPosts(Post)
        })
        .catch(error => this.$toast.error(error.message))
    },
    isActive(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1) {
        return true
      }
      return false
    },
    toggleCategory(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1) {
        this.selectedCategoryIds.splice(index, 1)
      } else {
        this.selectedCategoryIds.push(id)
      }
      if (!id) this.selectedCategoryIds = []
      this.filterPosts(this.selectedCategoryIds)
    },
  },
}
</script>
<style lang="scss">
#filter-posts-header {
  display: block;
}
.categories-list {
  text-align: center;
}
</style>
