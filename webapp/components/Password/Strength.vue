<template>
  <div class="field">
    <div class="password-strength-meter">
      <div
class="password-strength-meter-inner" :class="'strength-' + strength"
/>
    </div>
    <p class="help">
      <span
v-if="pass" :class="{ insecure: !isSecure }"
>
        {{ $t('settings.security.change-password.passwordSecurity') }}:
        <strong>{{ $t(`settings.security.change-password.passwordStrength${strength}`) }}</strong>
      </span>
      <span v-else>&nbsp;</span>
    </p>
  </div>
</template>

<script>
import zxcvbn from 'zxcvbn'
import { isEmpty } from 'lodash'

export default {
  name: 'PasswordMeter',
  props: {
    password: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      strength: null,
      isSecure: false,
      pass: this.password || null,
    }
  },
  watch: {
    password(pass) {
      // update password when prop is changing
      this.pass = pass || null

      // strength is the score calculated by zxcvbn
      const strength = !isEmpty(this.pass) ? zxcvbn(this.pass).score : null
      if (strength !== this.strength) {
        this.strength = strength
        this.isSecure = Boolean(strength >= 3)
        this.$emit('change', {
          strength,
          isSecure: this.isSecure,
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.password-strength-meter {
  position: relative;
  height: 3px;
  background: $color-neutral-85;
  margin: 10px auto 6px;
  border-radius: 3px;

  &:before,
  &:after {
    content: '';
    height: inherit;
    background: transparent;
    display: block;
    border-color: #fff;
    border-style: solid;
    border-width: 0 6px 0 6px;
    box-sizing: border-box;
    position: absolute;
    width: calc(20% + 6px);
    z-index: 10;
  }

  &:before {
    left: calc(20% - 6px);
  }
  &:after {
    right: calc(20% - 6px);
  }
}

.help {
  .insecure {
    strong {
      color: $color-danger;
    }
  }
}

.password-strength-meter-inner {
  background: transparent;
  height: inherit;
  position: absolute;
  width: 0;
  border-radius: inherit;
  transition: width 0.5s ease-in-out, background 0.25s;
}

.password-strength-meter-inner {
  &.strength-0 {
    background: darken($color-warning, 40%);
    width: 20%;
  }
  &.strength-1 {
    background: darken(mix($color-warning, $color-yellow, 50%), 30%);
    width: 40%;
  }
  &.strength-2 {
    background: darken($color-yellow, 20%);
    width: 60%;
  }
  &.strength-3 {
    background: darken($color-success, 10%);
    width: 80%;
  }
  &.strength-4 {
    background: $color-success;
    width: 100%;
  }
}
</style>
