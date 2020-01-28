<template>
  <editor-content :editor="editor" :key="content" />
</template>

<script>
import defaultExtensions from './defaultExtensions.js'
import Hashtag from './nodes/Hashtag.js'
import { Editor, EditorContent } from 'tiptap'

export default {
  name: 'ContentViewer',
  components: {
    EditorContent,
  },
  props: {
    content: { type: String, default: '' },
    doc: { type: Object, default: () => {} },
  },
  data() {
    return {
      editor: new Editor({
        doc: this.doc,
        content: this.content,
        editable: false,
        extensions: [
          // Hashtags must come first, see
          // https://github.com/scrumpy/tiptap/issues/421#issuecomment-523037460
          new Hashtag(),
          ...defaultExtensions(this),
        ],
      }),
    }
  },
  beforeUpdate() {
    this.editor.setContent(this.content)
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
