<template>
  <div :class="`${iframe ? 'vuep-iframe' : ''}`">
    <vuep
      :template="template"
      :iframe="iframe" />
  </div>
</template>

<script>
import Vuep from 'vuep'
import 'vuep/dist/vuep.css'

export default {
  name: 'CodeExample',
  data() {
    return {
      iframe: false
    }
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  components: {
    Vuep
  },
  computed: {
    template() {
      return this.getCode()
    }
  },
  methods: {
    getCode() {
      const codeLines = this.code.split('\n')
      const codeTypeMatch = codeLines[0].trim().match(/^[A-Za-z]+$/g)
      if (codeTypeMatch) {
        codeLines.shift()
        const codeType = codeTypeMatch[0]
        if (codeType === 'iframe') {
          this.iframe = true
        }
      }
      while (codeLines[0].trim() === '') {
        codeLines.shift()
      }
      while (codeLines[codeLines.length - 1].trim() === '') {
        codeLines.pop()
      }
      if (codeLines[0].trim() === '<template>') {
        return codeLines.join('\n')
      }
      const code = codeLines.map(line => '    ' + line).join('\n')
      /* eslint-disable */
      return `<template>
  <div>
${code}
  </div>
</template>
<script><\/script>`
    }
  }
}
</script>

<style lang="scss">
.vuep {
  display: flex;
  height: auto;
  font-family: inherit;
  flex-direction: column-reverse;
}

.vuep-editor {
  width: auto;
  height: auto;
  margin-right: 0;
}

.vuep-preview {
  width: auto;
  height: auto;
  border-radius: 0;
  border: $border-size-base solid $border-color-softer;
  padding: $space-base;
  margin-bottom: $space-small;

  .vuep-iframe & {
    padding: 0;
    min-height: 600px;
  }
}

// Codemirror Theme
$codemirror-background: $background-color-soft;
$codemirror-primary: $color-primary;

.cm-s-vueds {
	font-size: 1em;
	line-height: 1.5em;
	font-family: $font-family-code;
	letter-spacing: 0.3px;
	word-spacing: 1px;
	background: $codemirror-background;
	color: $text-color-soft;
	border: $border-size-base solid $border-color-softer;

	.CodeMirror-lines {
    padding: 8px 0;
  }

  .CodeMirror-gutters {
    background-color: $codemirror-background;
    border: none;
    border-right: $border-size-base solid $border-color-softer;
    padding-right: $space-x-small;
    z-index: 3;
  }

  div.CodeMirror-cursor {
    border-left: 2px solid $text-color-base;
  }

  .CodeMirror-activeline-background {
    background: rgba($codemirror-primary, 0.1);
  }
  .CodeMirror-selected {
    background: rgba($codemirror-primary, 0.1);
  }
  .cm-comment {
    font-style: italic;
    color: $text-color-softer;
  }
  .cm-tag {
    color: $codemirror-primary;
  }
  .cm-attribute {
    color: $text-color-warning;
  }
  .cm-keyword {
    color: $text-color-danger;
  }
  .cm-string {
    color: $text-color-success;
  }
  .cm-property {
    color: $text-color-warning;
  }
  .cm-variable-2 {
    color: $text-color-danger;
  }
  .cm-atom {
    color: $text-color-success;
  }
  .cm-number {
    color: $text-color-danger;
  }
  .cm-operator {
    color: $codemirror-primary;
  }
  .CodeMirror-linenumber {
    color: $text-color-softer;
  }
}
</style>
