<template>
  <span :title="fullDateTime">{{ relativeDateTime }}</span>
</template>

<script>
import { getDateFnsLocale } from '~/locales'
import formatRelative from 'date-fns/formatRelative'
import format from 'date-fns/format'

export default {
  name: 'HcRelativeDateTime',
  props: {
    dateTime: {
      type: [Date, String],
      required: true,
    },
  },
  computed: {
    relativeDateTime() {
      return formatRelative(new Date(this.dateTime), new Date(), { locale: getDateFnsLocale(this) })
    },
    fullDateTime() {
      const locale = getDateFnsLocale(this)
      return format(new Date(this.dateTime), 'PPpp', { locale })
    },
  },
}
</script>
