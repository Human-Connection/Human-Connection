module.exports = {
  "extends": "standard",
  "parser": "babel-eslint",
  "env": {
    "es6": true,
    "node": true,
    "jest/globals": true
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "quotes": [
      "error",
      "single"
    ]
  },
  "plugins": ["jest"]
};
