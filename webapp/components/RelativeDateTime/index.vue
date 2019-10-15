<template>
  <span>{{ relativeDateTime }}</span>
</template>

<script>
import { getDateFnsLocale } from '~/locales'
import formatRelative from 'date-fns/formatRelative'

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
  },
}
</script>
