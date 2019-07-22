import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import HcEditor from '~/components/Editor/Editor.vue'
import helpers from './helpers'

helpers.init()

const users = [{ id: 1, slug: 'peter' }, { id: 1, slug: 'sandra' }, { id: 1, slug: 'jane' }]

storiesOf('Editor', module)
  .addDecorator(withA11y)
  .addDecorator(storyFn => {
    const ctx = storyFn()
    return {
      components: { ctx },
      template: `
        <ds-card style="width: 50%; min-width: 500px; margin: 0 auto;">
          <ctx />
        </ds-card>
      `,
    }
  })
  .addDecorator(helpers.layout)
  .add('Empty', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
    }),
    template: `<hc-editor :users="users" />`,
  }))
  .add('Basic formatting', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: `
        <h3>Basic formatting</h3>
        <p>
          Here is some <em>italic</em>, <b>bold</b> and <u>underline</u> text.
          <br/>
          Also do we have some <a href="https://human-connection.org">inline links</a> here.
        </p>
        <h3>Heading 3</h3>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
        <h4>Heading 4</h4>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
        <h5>Heading 5</h5>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
        
        <h3>Unordered List</h3>
        <ul>
          <li><p>Also some list</p></li>
          <li><p>with</p></li>
          <li><p>several</p></li>
          <li><p>points</p></li>
        </ul>
        
        <h3>Ordered List</h3>
        <ol>
          <li><p>justo</p></li>
          <li><p>dolores</p></li>
          <li><p>et ea rebum</p></li>
          <li><p>kasd gubergren</p></li>
        </ol>
      `,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('@Mentions', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: `
        <p>
          Here you can mention people like 
          <a class="mention" href="/profile/1" target="_blank" contenteditable="false">@sandra</a> and others.
          Try it out!
        </p>
      `,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('#Hashtags', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: `
        <p>
          This text contains <a href="#" class="hashtag">#hashtags</a> for projects like <a href="https://human-connection.org" class="hashtag">#human-connection</a>
          Try to add more by typing #.
        </p>
      `,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('Embeds', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: `
        <p>The following link should be rendered with metainformation for its destination such as: Title, Description, Image, Pagename and Favicon.</p>
        <a class="embed" href="https://human-connection.org">Human Connection</a>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
      `,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
