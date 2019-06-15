<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <ds-heading tag="h3">
            {{ $t('password-reset.title') }}
          </ds-heading>
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
