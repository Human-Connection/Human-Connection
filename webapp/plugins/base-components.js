import Vue from 'vue'

const componentFiles = require.context('../components/_new/generic', true, /Base[a-zA-Z]+\.vue/)

componentFiles.keys().forEach((fileName) => {
  const component = componentFiles(fileName)
  const componentConfig = component.default || component
  const componentName = component.name || fileName.replace(/^.+\//, '').replace('.vue', '')

  Vue.component(componentName, componentConfig)
})
