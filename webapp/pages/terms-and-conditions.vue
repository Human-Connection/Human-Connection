<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAndConditions') }}</ds-heading>
    </ds-space>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.termsAndConditions') }}</ds-text>

        <div>
          <ol>
            <li>
              <strong>{{ $t('termsAndConditions.text0') }}</strong>
              {{ $t('termsAndConditions.text1') }}
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text2') }}</strong>
              {{ $t('termsAndConditions.text3') }}
              <a href="/data-privacy" target="_blank">{{ $t('termsAndConditions.text4') }}</a>
              .
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text5') }}</strong>
              {{ $t('termsAndConditions.text6') }}
              <a
                href="https://human-connection.org/alpha/#bugreport"
                target="_blank"
              >
                https://human-connection.org/support
              </a>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text7') }}</strong>
              {{ $t('termsAndConditions.text8') }}
              <a href="/code-of-conduct" target="_blank">
                https://alpha.human-connection.org/pages/code-of-conduct
              </a>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text9') }}</strong>
              {{ $t('termsAndConditions.text10') }}
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text11') }}</strong>
              {{ $t('termsAndConditions.text12') }}
              <a href="mailto:info@human-connection.org" target="_blank">
                info@human-connection.org
              </a>
              <strong>{{ $t('termsAndConditions.text13') }}</strong>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text14') }}</strong>
              {{ $t('termsAndConditions.text15') }}
              <a
                href="https://human-connection.org/events-und-news/"
                target="_blank"
              >
                https://human-connection.org/veranstaltungen/
              </a>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text16') }}</strong>
              {{ $t('termsAndConditions.text17') }}
              <a
                href="https://human-connection.org/alpha/#bugreport"
                target="_blank"
              >
                https://human-connection.org
              </a>
            </li>
          </ol>
          <p>{{ $t('termsAndConditions.text18') }}</p>
          <br />
          <p>
            <strong>{{ $t('termsAndConditions.text19') }}</strong>
          </p>
          <p>
            <strong>{{ $t('termsAndConditions.text20') }}</strong>
          </p>
        </div>
      </ds-space>

      <div>
        <ol>
          <li>
            <strong>RISK OF ACCIDENT:</strong>
            This is a test version! All data, your profile and the server can be completely
            destroyed, wiped out, lost, burnt and eventually synchronised near Alpha Centauri at any
            time. Use on your own risk. Commercial effects are not likely though.
          </li>
          <br />
          <li>
            <strong>YOU AND YOUR DATA:</strong>
            Please notice, that the content of the alpha version will be used for publicity and web
            presentations etc. but we are sure, this is to your interest. If you like use no
            surnames and if you want to disclose less data use a profile picture without identity.
            You can find more information in our
            <a href="/pages/privacy" target="_blank">privacy policy</a>
            .
          </li>
          <br />
          <li>
            <strong>SITE:</strong>
            This is still a test version. Please excuse if some applications are not working,
            blocking, irritating, displayed falsely or not able to be clicked on. Please report
            faults and bugs!
            <a href="https://human-connection.org/support" target="_blank">
              https://human-connection.org/support
            </a>
          </li>
          <br />
          <li>
            <strong>CODE OF CONDUCT</strong>
            : The code of conduct serves as guiding principles for our personal appearance and
            interaction with one another. Anyone who is active as a user in the Human Connection
            Network, writes articles, comments or contacts other users, including those outside the
            network, acknowledges these rules of conduct as binding:
            <a href="https://alpha.human-connection.org/pages/code-of-conduct" target="_blank">
              https://alpha.human-connection.org/pages/code-of-conduct
            </a>
          </li>
          <br />
          <li>
            <strong>MODERATION:</strong>
            As long as there is no community moderation-system in operation, a rainbow colored
            unicorn decides, if you are physically and mentally stable enough to operate our test
            version. The unicorn can delete you from the alpha version at any time. So be so kind
            and leave rainbow food!
          </li>
          <br />
          <li>
            <strong>FAIRNESS:</strong>
            If, against all expectations, our alpha version is not to your liking, we return your
            monthly payment within the first two months. Please send a mail to:
            <a href="mailto:info@human-connection.org" target="_blank">info@human-connection.org</a>
            .
            <strong>
              Attention: Pleace note that more features are build in on regular basis.
            </strong>
          </li>
          <br />
          <li>
            <strong>QUESTIONS?</strong>
            You can find the dates and links to our zoom-rooms here:
            <a href="https://human-connection.org/events-und-news/" target="_blank">
              https://human-connection.org/events-und-news/
            </a>
          </li>
          <br />
          <li>
            <strong>FROM HUMAN BEING TO HUMAN BEING:</strong>
            Please help us to get new donators for Human Connection, so the network can take off as
            soon as possible.
            <a href="https://human-connection.org/" target="_blank">https://human-connection.org</a>
          </li>
        </ol>
        <br />
        <p>
          Now have fun with the alpha version of Human Connection! For the first universal peace.
          <strong>♥︎</strong>
        </p>
        <p>
          <strong></strong>
        </p>
        <br />
        <p>
          <strong>Thank you very much,</strong>
        </p>
        <p>
          <strong>your Human Connection Team</strong>
        </p>
      </div>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'default',
  head() {
    return {
      title: this.$t('site.termsAndConditions'),
    }
  },
}
</script>
