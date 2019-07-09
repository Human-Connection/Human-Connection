<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <a slot="default" slot-scope="{ toggleMenu }" href="#" @click.prevent="toggleMenu()">
      <ds-icon style="margin: 5px 0px 0px 10px;" name="filter" size="large" />
      <ds-icon style="margin-left: 2px" size="xx-small" name="angle-down" />
    </a>
    <template slot="popover">
      <ds-container>
        <ds-space />
        <ds-flex>
          <ds-flex-item width="20%">
            <ds-space margin-bottom="x-small" />
            <ds-flex>
              <ds-heading tag="h4">{{ $t('filter-posts.header') }}</ds-heading>
              <ds-flex-item width="10%" />
              <ds-flex-item width="100%" style="text-align:center;">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in firstGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in secondGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in thirdGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in fourthGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in fifthGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in sixthGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in seventhGroup" :key="category.id" class="categories-list">
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
          <ds-flex-item width="10%">
            <ds-flex v-for="category in eigthGroup" :key="category.id" class="categories-list">
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
      firstGroup: [],
      secondGroup: [],
      thirdGroup: [],
      fourthGroup: [],
      fifthGroup: [],
      sixthGroup: [],
      seventhGroup: [],
      eigthGroup: [],
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
  mounted() {
    this.groupCategories()
  },
  methods: {
    ...mapMutations({
      setPosts: 'posts/SET_POSTS',
    }),
    groupCategories() {
      const groupedCategories = this.chunk
      this.firstGroup = groupedCategories[0]
      this.secondGroup = groupedCategories[1]
      this.thirdGroup = groupedCategories[2]
      this.fourthGroup = groupedCategories[3]
      this.fifthGroup = groupedCategories[4]
      this.sixthGroup = groupedCategories[5]
      this.seventhGroup = groupedCategories[6]
      this.eigthGroup = groupedCategories[7]
    },
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
.categories-list {
  text-align: center;
}
</style>
