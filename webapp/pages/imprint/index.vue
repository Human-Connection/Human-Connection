<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.imprint') }}</ds-heading>
    </ds-space>

    <ds-container>
      <ds-space margin-top="large">
        <ds-text>
          <div>
            <p>
              <strong>Human Connection gemeinnützige GmbH</strong>
            </p>
            <p>Bahnhofstr. 11</p>
            <p>73235 Weilheim / Teck</p>
            <p>{{ $t('site.germany') }}</p>
            <br />
            <p>
              <strong>{{ $t('site.contact') }}</strong>
            </p>
            <p>Tel.: +49 151 / 43 80 42 22</p>
            <p>
              E-Mail:
              <a
                class="hc-editor-link-blot"
                href="mailto:info@human-connection.org"
                target="_blank"
              >
                info@human-connection.org
              </a>
            </p>
            <br />
            <p>
              <strong>{{ $t('site.tribunal') }}</strong>
            </p>
            <p>Amtsgericht Stuttgart</p>
            <br />
            <p>
              <strong>{{ $t('site.register') }}</strong>
            </p>
            <p>HRB 741951</p>
            <br />
            <p>
              <strong>{{ $t('site.director') }}</strong>
            </p>
            <p>Dennis Hack</p>
            <br />
            <p>
              <strong>{{ $t('site.taxident') }}</strong>
            </p>
            <p>DE284651760</p>
            <br />
            <p>
              <strong>{{ $t('site.responsible') }}</strong>
            </p>
            <p>Dennis Hack</p>
            <p>Bahnhofstr. 11</p>
            <p>73235 Weilheim / Teck</p>
            <p>{{ $t('site.germany') }}</p>
            <br />
            <p>
              <strong>{{ $t('site.bank') }}</strong>
            </p>
            <p>GLS Bank</p>
            <p>IBAN:&nbsp;DE08 4306 0967 7024 1934 00</p>
            <p>BIC / SWIFT:&nbsp;GENODEM1GLS</p>
          </div>
        </ds-text>
      </ds-space>
    </ds-container>
  </div>
</template>
