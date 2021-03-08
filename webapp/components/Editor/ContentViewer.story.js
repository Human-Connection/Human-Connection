import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import ContentViewer from '~/components/Editor/ContentViewer.vue'
import helpers from '~/storybook/helpers'

helpers.init()

storiesOf('ContentViewer', module)
  .addDecorator(withA11y)
  .addDecorator((storyFn) => {
    const ctx = storyFn()
    return {
      components: { ctx },
      template: `
        <base-card style="width: 50%; min-width: 500px; margin: 0 auto;">
          <ctx />
        </base-card>
      `,
    }
  })
  .addDecorator(helpers.layout)
  .add('Basic formatting', () => ({
    components: { ContentViewer },
    store: helpers.store,
    data: () => ({
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
          <li>
            <p>points</p>
            <ul>
              <li>
                <p>and indentations</p>
                <p>as well as text parapgraphs</p>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p><p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
              </li>
            </ul>
          </li>
        </ul>

        <h3>Ordered List</h3>
        <ol>
          <li>
            <p>ordered lists</p>
            <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsu</p>
            <ol>
              <li>
                <p>can have indentations</p>
                <ol>
                  <li>
                <p>and text parapgraphs, too</p>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p><p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
                </li>
                </ol>
              </li>
            </ol>
          </li>
        </ol>
      `,
    }),
    template: `<content-viewer :content="content" />`,
  }))
