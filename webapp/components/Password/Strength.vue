<template>
  <div class="field">
    <div class="password-strength-meter">
      <div class="password-strength-meter-inner" :class="strengthClass"></div>
    </div>
    <p class="help">
      <span v-if="this.pass" :class="{ insecure: (passwordStrength < 3) }">
        {{ $t('settings.security.change-password.passwordSecurity') }}:
        <strong>{{ $t(`settings.security.change-password.passwordStrength${passwordStrength}`) }}</strong>
      </span>
      <span v-else>&nbsp;</span>
    </p>
  </div>
</template>

<script>
import zxcvbn from 'zxcvbn'
import { isEmpty } from 'lodash'

export default {
  props: {
    password: {
      type: String,
      required: true
    }
  },
  name: 'password-meter',
  data() {
    return {
      lastScore: 0,
      pass: this.password || null
    }
  },
  watch: {
    password(pass) {
      // update password when prop is changing
      this.pass = pass || null
    }
  },
  computed: {
    /**
     * passwordStrength is the score calculated by zxcvbn
     * @return {Number} Password Strength Score
     */
    passwordStrength() {
      const score = !isEmpty(this.pass) ? zxcvbn(this.pass).score : 'empty'
      if (score !== this.lastScore) {
        this.lastScore = score
        this.$emit('change', {
          score,
          isSecure: Boolean(score >= 3)
        })
      }
      return score
    },
    strengthClass() {
      return `strength-${this.passwordStrength}`
    }
  }
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
