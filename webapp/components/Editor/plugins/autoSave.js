import { Extension, Plugin, PluginKey } from 'tiptap'
import { DOMSerializer } from 'prosemirror-model'

export default class AutoSave extends Extension {
  constructor({ $route }) {
    super()
    this.route = $route
  }

  static toHTML(content, schema) {
    const container = document.createElement('div')
    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(content)
    container.appendChild(fragment)
    return container.innerHTML
  }

  static load(path) {
    const key = AutoSave.getStorageKey(path)
    return key ? localStorage[key] : null
  }

  static getStorageKey(path) {
    if (path === '/post/create') {
      // find a way to keep invisible random ids
      // for posts.
      // Once a draft is sent, the storage item
      // is deleted.
      const _postId = 'randomPostId'
      return `draft:post:${_postId}`
    }

    const commentMatch = path.match(/^\/post\/([0-9a-f-]*)\/[\w-]*$/)
    if (commentMatch) {
      const key = `draft:${commentMatch[1]}`
      return key
    }

    return null
  }

  get name() {
    return 'auto_save'
  }

  get storageKey() {
    return AutoSave.getStorageKey(this.route.path)
  }

  get plugins() {
    return [
      new Plugin({
        key: new PluginKey('auto_save'),
        filterTransaction: (tr, editorState) => {
          if (tr.docChanged && this.storageKey) {
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
