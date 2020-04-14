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
      mode = null,
    } = AutoSave.fromPath(this.route.path)
    this.id = id
    this.editorType = editorType
    this.mode = mode
  }

  static fromPath(path) {
    let [, editorType, mode, postId] =
      path.match(/^\/?(post)\/(?:(create|edit)\/?)([a-f\d-]*)?$/) || []

    if (editorType) {
      postId = postId || Date.now().toString()
      return { editorType, mode, id: hash(postId, 0xb0b).toString(16) }
    }

    const [, commentPostId] = path.match(/^\/post\/([a-f\d-]*)\/[\w-]*$/) || []

    if (commentPostId) {
      return { editorType: 'comment', id: hash(commentPostId, 0xb0b).toString(16) }
    }

    return {}
  }

  static toHTML(content, schema) {
    const container = document.createElement('div')
    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(content)
    container.appendChild(fragment)
    return container.innerHTML
  }

  static lastSave(path) {
    let { mode, editorType = path } = AutoSave.fromPath(path)

    const id = localStorage.getItem(`autosave:${editorType}:last`)

    if (mode === 'edit' || !id) {
      return null
    }

    const key = AutoSave.getStorageKey(id, editorType)
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

            if (this.mode !== 'edit') {
              localStorage.setItem(`autosave:${this.editorType}:last`, this.id)
            }
          }
          return tr
        },
      }),
    ]
  }
}
