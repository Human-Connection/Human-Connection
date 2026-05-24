<template>
  <span :title="absoluteDateTime">{{ relativeDateTime }}</span>
</template>

<script>
import { getDateFnsLocale } from '~/locales'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import format from 'date-fns/format'
import formatRelative from 'date-fns/formatRelative'

const fullDateTimeFormat = 'Pp'
const maxRelativeFormatDays = 6

export default {
  name: 'HcRelativeDateTime',
  props: {
    dateTime: {
      type: [Date, String],
      required: true,
    },
  },
  computed: {
    date() {
      return new Date(this.dateTime)
    },
    dateFnsLocale() {
      return getDateFnsLocale(this)
    },
    absoluteDateTime() {
      return format(this.date, fullDateTimeFormat, { locale: this.dateFnsLocale })
    },
    relativeDateTime() {
      const daysFromToday = Math.abs(differenceInCalendarDays(this.date, new Date()))
      if (daysFromToday > maxRelativeFormatDays) return this.absoluteDateTime

      return formatRelative(this.date, new Date(), { locale: this.dateFnsLocale })
    },
  },
}
</script>
