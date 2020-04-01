import { normalizeEmail } from 'validator'

export default (email) =>
  normalizeEmail(email, {
    // gmail_remove_dots: false, default
    gmail_remove_subaddress: false,
    // gmail_convert_googlemaildotcom: true, default
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  })
