<template>
  <!-- eslint-disable -->
  <td
    class="ds-table-col"
    :class="[
      align && `ds-table-col-${align}`
    ]">
    <slot/>
  </td>
</template>

<script>
/**
 * Used in combination with the table component to create data tables.
 * @version 1.0.0
 * @see DsTable
 * @private
 */
export default {
  name: 'DsTableCol',
  inject: {
    $parentTable: {
      default: null
    }
  },
  props: {
    /**
     * The column width
     */
    width: {
      type: [String, Number, Object],
      default: null
    },
    /**
     * The column align
     * @options left|center|right
     */
    align: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(left|center|right)/)
      }
    }
  },
  computed: {}
}
</script>
