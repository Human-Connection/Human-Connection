/**
 * iterate through all fields and replace it with the callback result
 * @property data Array
 * @property fields Array
 * @property callback Function
 */
function walkRecursive(data, fields, callback, _key) {
  if (!Array.isArray(fields)) {
    throw new Error('please provide an fields array for the walkRecursive helper')
  }
  if (data && typeof data === 'string' && fields.includes(_key)) {
    // well we found what we searched for, lets replace the value with our callback result
    data = callback(data, _key)
  } else if (data && Array.isArray(data)) {
    // go into the rabbit hole and dig through that array
    data.forEach((res, index) => {
      data[index] = walkRecursive(data[index], fields, callback, index)
    })
  } else if (data && typeof data === 'object') {
    // lets get some keys and stir them
    Object.keys(data).forEach(k => {
      data[k] = walkRecursive(data[k], fields, callback, k)
    })
  }
  return data
}

export default walkRecursive
