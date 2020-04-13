import { Extension, Plugin, PluginKey } from 'tiptap'
import { DOMSerializer } from 'prosemirror-model'
import { h32 as hash } from 'xxhashjs'

export default class AutoSave extends Extension {
  constructor({ $route }) {
    super()

    this.route = $route
    const {
      id = hash(Date.now().toString(), 0xb0b).toString(16),
      editorType = this.route.path,
    } = AutoSave.fromPath(this.route.path)
    this.id = id
    this.editorType = editorType
  }

  static fromPath(path) {
    if (path === '/post/create') {
      return { editorType: 'post' }
    }

    const commentMatch = path.match(/^\/post\/([0-9a-f-]*)\/[\w-]*$/)
    if (commentMatch) {
      return { editorType: 'comment', id: hash(commentMatch[1], 0xb0b).toString(16) }
    }

    return {}
  }

  static toHTML(content, schema) {
    const container = document.createElement('div')
    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(content)
    container.appendChild(fragment)
    return container.innerHTML
  }

  static load(path) {
    const { id, editorType = path } = AutoSave.fromPath(path)
    const _id = localStorage.getItem(`autosave:${editorType}:last`)
    if (!_id) {
      return null
    }
    const key = AutoSave.getStorageKey(_id, editorType)
    return localStorage[key]
  }

  static getStorageKey(id, editorType) {
    return `autosave:${editorType}:${id}`
  }

  get name() {
    return 'auto_save'
  }

  get storageKey() {
    return AutoSave.getStorageKey(this.id, this.editorType)
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
            localStorage.setItem(`autosave:${this.editorType}:last`, this.id)
          }
          return tr
        },
      }),
    ]
  }
}
