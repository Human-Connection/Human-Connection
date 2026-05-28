<template>
  <time :datetime="machineDateTime" :title="absoluteDateTime">{{ relativeDateTime }}</time>
</template>

<script>
import { getDateFnsLocale } from '~/locales'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import format from 'date-fns/format'
import formatRelative from 'date-fns/formatRelative'

const RELATIVE_DATE_WINDOW_DAYS = 6

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
      return format(this.date, 'Pp', { locale: this.dateFnsLocale })
    },
    machineDateTime() {
      return this.date.toISOString()
    },
    relativeDateTime() {
      const calendarDayDistance = Math.abs(differenceInCalendarDays(this.date, new Date()))

      if (calendarDayDistance > RELATIVE_DATE_WINDOW_DAYS) {
        return this.absoluteDateTime
      }

      return formatRelative(this.date, new Date(), { locale: this.dateFnsLocale })
    },
  },
}
</script>
