import { enUS, de, nl, fr, es, it, pt, pl } from 'date-fns/locale'
import find from 'lodash/find'

const locales = [
  {
    name: 'English',
    code: 'en',
    iso: 'en-US',
    enabled: true,
    dateFnsLocale: enUS,
  },
  {
    name: 'Deutsch',
    code: 'de',
    iso: 'de-DE',
    enabled: true,
    dateFnsLocale: de,
  },
  {
    name: 'Nederlands',
    code: 'nl',
    iso: 'nl-NL',
    enabled: true,
    dateFnsLocale: nl,
  },
  {
    name: 'Français',
    code: 'fr',
    iso: 'fr-FR',
    enabled: true,
    dateFnsLocale: fr,
  },
  {
    name: 'Italiano',
    code: 'it',
    iso: 'it-IT',
    enabled: true,
    dateFnsLocale: it,
  },
  {
    name: 'Español',
    code: 'es',
    iso: 'es-ES',
    enabled: true,
    dateFnsLocale: es,
  },
  {
    name: 'Português',
    code: 'pt',
    iso: 'pt-PT',
    enabled: true,
    dateFnsLocale: pt,
  },
  {
    name: 'Polski',
    code: 'pl',
    iso: 'pl-PL',
    enabled: true,
    dateFnsLocale: pl,
  },
]

export default locales
export function getDateFnsLocale({ $i18n }) {
  const { dateFnsLocale } = find(locales, { code: $i18n.locale() }) || {}
  return dateFnsLocale || enUS
}
