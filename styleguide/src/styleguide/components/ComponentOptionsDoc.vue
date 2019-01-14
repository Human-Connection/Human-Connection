<template>
  <div>
    <ds-space v-if="componentProps">
      <ds-heading tag="h2">{{ component.name | componentName }} Props</ds-heading>
      <ds-card>
        <ds-table
          :data="componentProps"
          :fields="propFields">
          <template
            slot="name"
            slot-scope="{row}">
            <ds-code inline>
              {{ row.name | kebabCase }}
            </ds-code>
            <div v-if="row.required">
              <ds-tag v-if="row.required" color="warning">required</ds-tag>
            </div>
            <ds-space :margin-bottom="null" margin-top="small">
              <div v-if="row.options">
                <ds-chip size="small" v-for="option in row.options" :key="option">
                  {{ option }}
                </ds-chip>
              </div>
              <ds-text color="soft">{{ row.description }}</ds-text>
            </ds-space>
          </template>
          <template
            slot="type"
            slot-scope="{row}">
            <ds-chip
              v-for="type in row.types"
              :key="type"
              inline>
              {{ type }}
            </ds-chip>
          </template>
          <template
            slot="default"
            slot-scope="{row}">
            <ds-chip
              v-if="row.defaultValue"
              color="primary">
              <template v-if="row.default">
                {{ row.default }}
              </template>
              <template v-else-if="row.defaultValue.func">
                Function()
              </template>
              <template v-else>
                {{ row.defaultValue.value }}
              </template>
            </ds-chip>
          </template>
        </ds-table>
      </ds-card>
    </ds-space>
    <ds-space v-if="componentSlots && componentSlots.length">
      <ds-heading tag="h2">{{ component.name | componentName }} Slots</ds-heading>
      <ds-card>
        <ds-table
          :data="componentSlots"
          :fields="slotFields">
          <ds-code
            slot="name"
            slot-scope="{row}"
            inline>
              {{ row.name }}
          </ds-code>
          <ds-text
            color="soft"
            slot="description"
            slot-scope="{row}">
            {{ row.description }}
          </ds-text>
        </ds-table>
      </ds-card>
    </ds-space>
    <ds-space v-if="componentEvents && componentEvents.length">
      <ds-heading tag="h2">{{ component.name | componentName }} Events</ds-heading>
      <ds-card>
        <ds-table
          :data="componentEvents"
          :fields="eventFields">
          <ds-code
            slot="name"
            slot-scope="{row}"
            inline>
              @{{ row.name }}
          </ds-code>
          <ds-text
            color="soft"
            slot="description"
            slot-scope="{row}">
            {{ row.description }}
          </ds-text>
        </ds-table>
      </ds-card>
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
          label: 'Name'
        },
        type: {
          label: 'Type',
          width: '20%'
        },
        default: {
          label: 'Default',
          width: '20%'
        }
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
      return Object.keys(this.component.props)
        .map(name => {
          return this.getPropAttributes(name, this.component.props[name])
        })
        .sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
    },
    componentSlots() {
      if (!this.component.slots) {
        return null
      }
      return Object.keys(this.component.slots)
        .map(name => {
          return {
            name: (name.match(/[^/"\\]+/g) || []).join(''),
            ...this.component.slots[name]
          }
        })
        .sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
    },
    componentEvents() {
      if (!this.component.events) {
        return null
      }
      return Object.keys(this.component.events)
        .map(name => {
          return {
            name,
            ...this.component.events[name]
          }
        })
        .sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
    }
  },
  methods: {
    getPropAttributes(name, oldAttributes) {
      const attributes = {
        name,
        ...oldAttributes,
        ...this.getAttributesFromComment(oldAttributes.comment)
      }
      if (attributes.type && attributes.type.name) {
        attributes.types = attributes.type.name.split('|')
      }
      return attributes
    },
    getAttributesFromComment(comment) {
      const attributes = {}
      const optionsMatch = comment.match(/@options[ ]+(\S[ \S]*)\n/)
      if (optionsMatch) {
        attributes.options = optionsMatch[1].split('|')
      }
      const defaultMatch = comment.match(/@default[ ]+(\S[ \S]*)\n/)
      if (defaultMatch) {
        attributes.default = defaultMatch[1]
      }
      return attributes
    }
  }
}
</script>

<style lang="scss">
</style>
