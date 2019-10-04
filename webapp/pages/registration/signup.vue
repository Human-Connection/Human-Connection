<template>
  <ds-container width="medium">
    <ds-card>
      <ds-flex gutter="small">
        <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
          <client-only>
            <locale-switch class="login-locale-switch" offset="5" />
          </client-only>
          <ds-space margin-top="small" margin-bottom="xxx-small" centered>
            <img class="signup-image" alt="Human Connection" src="/img/sign-up/nicetomeetyou.svg" />
          </ds-space>
        </ds-flex-item>
        <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
          <signup :invitation="false" />
        </ds-flex-item>
      </ds-flex>
    </ds-card>
  </ds-container>
</template>

<script>
import Signup from '~/components/Registration/Signup'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

export default {
  layout: 'no-header',
  components: {
    Signup,
    LocaleSwitch,
  },
}
</script>

<style lang="scss" scoped>
.signup-image {
  width: 90%;
  max-width: 200px;
}
.login-card {
  position: relative;
}
</style>
