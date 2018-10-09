<template>
  <th class="ds-table-head-col">
    <slot>
      {{ label }}
    </slot>
  </th>
</template>

<script>
/**
 * Used in combination with the table component to create data tables.
 * @version 1.0.0
 * @see DsTable
 * @private
 */
export default {
  name: 'DsTableHeadCol',
  inject: {
    $parentTable: {
      default: null
    }
  },
  props: {
    /**
     * The column value
     */
    label: {
      type: [Number, String, Array, Object],
      default() {
        return null
      }
    },
    /**
     * The column width
     */
    width: {
      type: [String, Number, Object],
      default: null
    }
  },
  computed: {}
}
</script>
