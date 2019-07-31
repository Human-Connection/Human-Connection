<template>
  <editor-content :editor="editor" />
</template>

<script>
import defaultExtensions from './defaultExtensions.js'
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
        extensions: defaultExtensions(this),
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
