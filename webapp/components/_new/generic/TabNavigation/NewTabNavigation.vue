<template>
  <!-- Wolle siehe TabNavigator <ul class="tab-navigation">
    <li
      v-for="tab in tabs"
      :key="tab.type"
      :class="[
        activeTab === tab.type && '--active',
        tab.disabled && '--disabled',
        'tab',
        tab.type + '-tab',
      ]"
      :style="tabWidth"
      role="button"
      :data-test="tab.type + '-tab'"
      @click="$emit('switchTab', tab.type)"
    >
      <ds-space margin="small">
          {{ tab.count }}
      </ds-space>
    </li>
  </ul> -->
  <ds-grid-item class="profile-top-navigation" :row-span="3" column-span="fullWidth">
    <base-card class="ds-tab-nav">
      <ul class="Tabs">
        <li
          v-for="tab in tabs"
          :key="tab.type"
          class="Tabs__tab pointer" :class="{ active: activeTab === tab.type }">
          <a @click="$emit('switch', tab.type)">
            <ds-space margin="small">
              <!-- Wolle translate -->
              <client-only placeholder="Loading...">
                <ds-number :label="tab.title">
                  <hc-count-to slot="count" :end-val="tab.count" />
                </ds-number>
              </client-only>
            </ds-space>
          </a>
        </li>
      </ul>
    </base-card>
  </ds-grid-item>
</template>

<script>
import HcCountTo from '~/components/CountTo.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'

export default {
  components: {
    HcCountTo,
    MasonryGridItem,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    activeTab: {
      type: String,
    },
  },
  // Wolle computed: {
  //   tabWidth() {
  //     return 'width: ' + String(100.0 / this.tabs.length) + '%'
  //   },
  // },
  // Wolle
  // methods: {
  //   tabTitle(index) {
  //     console.log('activeTab: ', this.activeTab)
  //     console.log('tabTitle: ', this.tabs[index].title)
  //     return this.tabs[index].title
  //   },
  // },
}
</script>

<style lang="scss">
// Wolle clean up
// .tab-navigation {
//   display: flex;
//   margin-top: $space-small;

//   > .tab {
//     font-weight: $font-weight-bold;
//     padding: $space-x-small $space-small;
//     margin-right: $space-xx-small;
//     border-radius: $border-radius-base $border-radius-base 0 0;
//     background: $color-neutral-100;
//     cursor: pointer;

//     &.--active {
//       background: $color-neutral-80;
//       border: none;
//     }

//     &.--disabled {
//       background: $background-color-disabled;
//       border: $border-size-base solid $color-neutral-80;
//       border-bottom: none;
//       pointer-events: none;
//       cursor: default;
//     }

//     &:hover:not(.--active) {
//       background: $color-neutral-85;
//     }
//   }
// }


.pointer {
  cursor: pointer;
}

.Tabs {
  position: relative;
  background-color: #fff;
  height: 100%;
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;

  &__tab {
    text-align: center;
    height: 100%;
    flex-grow: 1;

    &:hover {
      border-bottom: 2px solid #c9c6ce;
    }

    &.active {
      border-bottom: 2px solid #17b53f;
    }
  }
}
.profile-top-navigation {
  position: sticky;
  top: 53px;
  z-index: 2;
}
.ds-tab-nav.base-card {
  padding: 0;

  .ds-tab-nav-item {
    // Wolle is this doubled?
    &.ds-tab-nav-item-active {
      border-bottom: 3px solid #17b53f;
      &:first-child {
        border-bottom-left-radius: $border-radius-x-large;
      }
      &:last-child {
        border-bottom-right-radius: $border-radius-x-large;
      }
    }
  }
}
</style>
