<template>
  <!-- eslint-disable vue/html-self-closing -->
  <div>
    <!-- TODO: use custom dropdown menu, popover or modal for language selection -->
    <a
      v-if="$i18n.locale() === 'en'"
      href="#"
      @click.prevent="changeLanguage('de')"
    >
      <img
        alt="English"
        src="/img/locale-flags/en.svg"
        height="26"
      />
    </a>
    <a
      v-else
      href="#"
      @click.prevent="changeLanguage('en')"
    >
      <img
        alt="Deutsch"
        src="/img/locale-flags/de.svg"
        height="26"
      />
    </a>
  </div>
</template>

<script>
export default {
  methods: {
    changeLanguage(locale) {
      // TODO: move that logic to store!?
      // check if the locale has already been loaded
      if (this.$i18n.localeExists(locale)) {
        this.$i18n.set(locale)
        return
      }
      import(`~/locales/${locale}.json`).then(res => {
        this.$i18n.add(locale, res.default)
        this.$i18n.set(locale)
      })
    }
  }
}
</script>
