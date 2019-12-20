const express = require('express');

const resize = require('./resize');

const server = express();
server.get('/', (req, res) => {
  const widthString = req.query.width;
  const heightString = req.query.height;
  const format = req.query.format;
  let width, height;
  if (widthString) width = parseInt(widthString);
  if (heightString) height = parseInt(heightString);
  res.type(`image/${format || 'png'}`);
  resize('../webapp/static/img/sign-up/onourjourney.png', format, width, height).pipe(res);
});
server.listen(4001, () => {
  console.log('This is a kick ass image micro service');
});