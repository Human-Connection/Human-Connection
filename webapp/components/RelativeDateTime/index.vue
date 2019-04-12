<template>
  <span>{{ relativeDateTime }}</span>
</template>

<script>
import formatRelative from 'date-fns/formatRelative'
import { enUS, de, nl, fr, pt, es /*, pl*/ } from 'date-fns/locale'
const locales = {
  en: enUS,
  de,
  nl,
  fr,
  es,
  pt
  //pl
}

export default {
  name: 'HcRelativeDateTime',
  props: {
    dateTime: {
      type: [Date, String],
      required: true
    }
  },
  computed: {
    relativeDateTime() {
      let locale = locales[this.$i18n.locale() || 'en']
      return formatRelative(new Date(this.dateTime), new Date(), { locale })
    }
  }
}
</script>
