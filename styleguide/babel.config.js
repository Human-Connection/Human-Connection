module.exports = {
  presets: [
    '@vue/app',
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import'
  ]
}
