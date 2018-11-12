<template>
  <div
    class="ds-table-wrap"
    v-if="dataArray">
    <table
      cellpadding="0"
      cellspacing="0"
      class="ds-table"
      :class="[
        condensed && 'ds-table-condensed',
        bordered && 'ds-table-bordered'
    ]">
      <colgroup>
        <col
          v-for="header in headers"
          :key="header.key"
          :width="header.width">
      </colgroup>
      <thead>
        <tr>
          <ds-table-head-col
            v-for="header in headers"
            :key="header.key">
            {{ header.label }}
          </ds-table-head-col>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="row.key || index">
          <ds-table-col
            v-for="col in row"
            :key="col.key">
            <!-- @slot Slots are named by fields -->
            <slot
              :name="col.key"
              :row="dataArray[index] ? dataArray[index] : null"
              :col="col"
              :index="index">
              {{ col.value }}
            </slot>
          </ds-table-col>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import startCase from 'lodash/startCase'

/**
 * Used in combination with the table row to create data tables.
 * @version 1.0.0
 */
export default {
  name: 'DsTable',
  provide() {
    return {
      $parentTable: this
    }
  },
  props: {
    /**
     * The table's data
     */
    data: {
      type: [Array, Object],
      default() {
        return []
      }
    },
    /**
     * The table's header config
     */
    fields: {
      type: [Array, Object],
      default() {
        return null
      }
    },
    /**
     * Should the table be more condense?
     */
    condensed: {
      type: Boolean,
      default: false
    },
    /**
     * Should the table have borders?
     */
    bordered: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    dataArray() {
      if (Array.isArray(this.data)) {
        return this.data
      }
      if (typeof this.data === 'object') {
        return Object.keys(this.data).map(key => this.data[key])
      }
      return []
    },
    headers() {
      let keys = this.dataArray[0] ? Object.keys(this.dataArray[0]) : []
      let headerObj = {}
      if (this.fields) {
        if (Array.isArray(this.fields)) {
          keys = this.fields
        } else if (typeof this.fields === 'object') {
          keys = Object.keys(this.fields)
          headerObj = this.fields
        }
      }

      return keys.map(key => {
        let header = {
          key,
          label: this.parseLabel(key),
          width: ''
        }
        if (headerObj[key]) {
          const headerMerge =
            typeof headerObj[key] === 'string'
              ? { label: headerObj[key] }
              : headerObj[key]
          header = Object.assign(header, headerMerge)
        }
        return header
      })
    },
    rows() {
      let keys = this.dataArray[0] ? Object.keys(this.dataArray[0]) : []
      return this.dataArray.map(row => {
        if (this.fields) {
          keys = Array.isArray(this.fields)
            ? this.fields
            : Object.keys(this.fields)
        }

        return keys.map(key => {
          return {
            key,
            value: row[key]
          }
        })
      })
    }
  },
  methods: {
    parseLabel(label) {
      return startCase(label)
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
