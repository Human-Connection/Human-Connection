import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import BaseIcon from './BaseIcon.vue'
import { iconNames } from '~/assets/_new/icons'

const wrapperStyles = `
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
`

const iconPresenterStyles = `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 20%;
  max-width: 120px;
  height: 120px;
  padding: 12px;
  margin-right: 20px;
  margin-bottom: 20px;
  background-color: white;
  text-align: center;
`

const iconStyles = `
  font-size: 20px;
`

storiesOf('Generic/BaseIcon', module)
  .addDecorator(helpers.layout)

  .add('pure icon', () => ({
    components: { BaseIcon },
    template: '<base-icon name="tree" />',
  }))

  .add('all icons', () => ({
    components: { BaseIcon },
    data() {
      return { iconNames }
    },
    template: `
      <div style="${wrapperStyles}">
        <div v-for="name in iconNames" :key="name" style="${iconPresenterStyles}">
          <base-icon :name="name" style="${iconStyles}" />
          {{ name }}
        </div>
      </div>
    `,
  }))
