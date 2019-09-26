<template>
  <transition name="fade" appear>
    <ds-container width="medium">
      <ds-card>
        <ds-space>
          <client-only>
            <locale-switch class="login-locale-switch" offset="5" />
          </client-only>
        </ds-space>
        <ds-flex>
          <ds-flex-item :width="{ base: '100%', sm: 1, md: 1 }">
            <ds-space>
              <img class="login-image" alt="Human Connection" src="/img/sign-up/onourjourney.svg" />
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: 1, md: 1 }">
            <ds-flex-item>
              <ds-heading tag="h3">{{ $t('maintenance.title') }}</ds-heading>
            </ds-flex-item>
            <ds-flex-item>
              <ds-space margin="small">
                <ds-text>{{ $t('maintenance.explanation') }}</ds-text>
                <ds-text>
                  {{ $t('maintenance.questions') }}
                  <a href="mailto:support@human-connection.org" class="email-link">
                    support@human-connection.org
                  </a>
                  .
                </ds-text>
              </ds-space>
            </ds-flex-item>
          </ds-flex-item>
        </ds-flex>
      </ds-card>
    </ds-container>
  </transition>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

export default {
  layout: 'blank',
  components: {
    LocaleSwitch,
  },
}
</script>
