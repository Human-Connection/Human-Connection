import { Extension, Plugin, PluginKey } from 'tiptap'
import { DOMSerializer } from 'prosemirror-model'

export default class AutoSave extends Extension {
  constructor({ $route }) {
    super()
    this.route = $route
    this._postId = 'randomIdForPosts'
  }

  static toHTML(content, schema) {
    const container = document.createElement('div')
    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(content)
    container.appendChild(fragment)
    return container.innerHTML
  }

  get name() {
    return 'auto_save'
  }

  get storageKey() {
    if (this.route.path === '/post/create') {
      return `draft:post:${this._postId}`
    }

    const commentMatch = this.route.path.match(/^\/post\/([0-9a-f-]*)\/[\w-]*$/)
    if (commentMatch) {
      const key = `draft:${commentMatch[1]}`
      return key
    }

    return null
  }

  get plugins() {
    return [
      new Plugin({
        key: new PluginKey('auto_save'),
        filterTransaction: (tr, editorState) => {
          if (tr.docChanged) {
            localStorage.setItem(
              this.storageKey,
              AutoSave.toHTML(tr.doc.content, editorState.config.schema),
            )
          }
          return tr
        },
      }),
    ]
  }
}
