<template>
  <div>
    <ds-space v-if="componentProps">
      <ds-heading tag="h2">{{ component.name | componentName }} Props</ds-heading>
      <ds-table
        :data="componentProps"
        :fields="propFields">
        <template
          slot="name"
          slot-scope="scope">
          {{ scope.row.name }} <span v-if="scope.row.required">*</span>
        </template>
        <template
          slot="type"
          slot-scope="scope">
          {{ scope.row.type.name }}
        </template>
        <template
          slot="default"
          slot-scope="scope">
          <template v-if="scope.row.defaultValue">
            <span v-if="scope.row.defaultValue.func">
              Function()
            </span>
            <span v-else>
              {{ scope.row.defaultValue.value }}
            </span>
          </template>
        </template>
      </ds-table>
    </ds-space>
    <ds-space v-if="componentSlots && componentSlots.length">
      <ds-heading tag="h2">{{ component.name | componentName }} Slots</ds-heading>
      <ds-table
        :data="componentSlots"
        :fields="slotFields"/>
    </ds-space>
    <ds-space v-if="componentEvents && componentEvents.length">
      <ds-heading tag="h2">{{ component.name | componentName }} Events</ds-heading>
      <ds-table
        :data="componentEvents"
        :fields="eventFields"/>
    </ds-space>
  </div>
</template>

<script>
export default {
  name: 'ComponentOptionsDoc',
  props: {
    component: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      propFields: {
        name: {
          label: 'Name',
          width: '20%'
        },
        type: {
          label: 'Type',
          width: '20%'
        },
        default: {
          label: 'Default',
          width: '20%'
        },
        description: 'Description'
      },
      slotFields: {
        name: {
          label: 'Name',
          width: '20%'
        },
        description: 'Description'
      },
      eventFields: {
        name: {
          label: 'Name',
          width: '20%'
        },
        description: 'Description'
      }
    }
  },
  computed: {
    componentProps() {
      if (!this.component.props) {
        return null
      }
      return Object.keys(this.component.props).map(name => {
        return {
          name,
          ...this.component.props[name]
        }
      })
    },
    componentSlots() {
      if (!this.component.slots) {
        return null
      }
      return Object.keys(this.component.slots).map(name => {
        return {
          name: (name.match(/[^/"\\]+/g) || []).join(''),
          ...this.component.slots[name]
        }
      })
    },
    componentEvents() {
      if (!this.component.events) {
        return null
      }
      return Object.keys(this.component.events).map(name => {
        return {
          name,
          ...this.component.events[name]
        }
      })
    }
  }
}
</script>

<style lang="scss">
</style>
