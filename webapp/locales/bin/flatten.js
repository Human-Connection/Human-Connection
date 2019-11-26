var flatten;

flatten = function(obj, path, result) {
  var key, val, _path;
  path = path || [];
  result = result || {};
  for (key in obj) {
    val = obj[key];
    _path = path.concat([key]);
    if (val instanceof Object) {
      flatten(val, _path, result);
    } else {
      result[_path.join('.')] = val;
    }
  }
  return result;
};


var flatten, obj;

obj = {
  foo: 'bar',
  bar: 'foo',
  foobar: {
    foo: 'foo',
    bar: 'bar'
  }
};

console.log(flatten(obj));

/* RESULT:
    {
      'foo': 'bar',
      'bar': 'foo',
      'foobar.foo': 'foo',
      'foobar.bar': 'bar'
    }
*/