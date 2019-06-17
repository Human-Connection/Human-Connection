<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <ds-card class="password-reset-card">
            <ds-space margin="large">
              <form>
                <ds-input
                  :placeholder="$t('login.email')"
                  type="email"
                  name="email"
                  icon="envelope"
                />
                <ds-space margin-botton="large">
                  <ds-text>
                    {{ $t('password-reset.form.description') }}
                  </ds-text>
                </ds-space>
                <ds-button primary fullwidth name="submit" type="submit" icon="sign-in">
                  {{ $t('password-reset.form.submit') }}
                </ds-button>
              </form>
            </ds-space>
          </ds-card>
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>

<script>
export default {
  layout: 'default',
}
</script>
