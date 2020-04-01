export default {
  basicFormatting: `
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
  mentions: `
        <p>
          Here you can mention people like
          <a class="mention" data-mention-id="2" href="/profile/1" target="_blank" contenteditable="false">@sandra</a> and others.
          Try it out!
        </p>
      `,
  hashtags: `
        <p>
          This text contains <a href="#" class="hashtag">#hashtags</a> for projects like <a href="https://human-connection.org" class="hashtag">#human-connection</a>
          Try to add more by typing #.
        </p>
      `,
  iframeEmbed: `
        <a class="embed" href="https://www.youtube.com/watch?v=qkdXAtO40Fo">
          <em>https://www.youtube.com/watch?v=qkdXAtO40Fo</em>
        </a>
      `,
  linkEmbed: `
       <a class="embed" href="https://telegram.org/">
         <em>https://telegram.org/</em>
       </a>
      `,
}
