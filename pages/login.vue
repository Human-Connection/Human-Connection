<template>
  <ds-container width="small">
    <ds-space margin="small">
      <blockquote>
        <p>
          Viele kleine Leute, an vielen kleinen Orten, die viele kleine Dinge tun, werden das Antlitz dieser Welt verändern.
        </p>
        <b>- Afrikanisches Sprichwort</b>
      </blockquote>
    </ds-space>
    <ds-card>
      <ds-flex>
        <ds-flex-item
          :width="{ base: '100%', sm: 1 }"
          center>
          <ds-space
            margin="large"
            center>
            <img
              class="login-image"
              src="/img/sign-up/humanconnection.svg"
              alt="Human Connection">
          </ds-space>
        </ds-flex-item>
        <ds-flex-item
          :width="{ base: '100%', sm: 1 }"
          center>
          <ds-space margin="small">
            <ds-text size="small">Wenn Du ein Konto bei Human Connection hast, melde Dich bitte hier an.</ds-text>
          </ds-space>
          <form>
            <ds-input
              placeholder="Deine E-Mail"
              icon="envelope"/>
            <ds-input
              placeholder="Dein Password"
              icon="lock"
              icon-right="question-circle"
              type="password"/>
            <ds-button
              primary
              full-width>
              Anmelden
            </ds-button>
            <ds-space margin="x-small">
              <a
                href="https://human-connection.org"
                title="zur Präsentationsseite"
                target="_blank">Was ist Human Connection?</a>
            </ds-space>
          </form>
        </ds-flex-item>
      </ds-flex>
    </ds-card>
  </ds-container>
</template>

<script>
export default {
  layout: 'blank'
}
</script>

<style lang="scss">
.login-image {
  width: 90%;
  max-width: 200px;
  margin-right: 20px;
}
</style>
