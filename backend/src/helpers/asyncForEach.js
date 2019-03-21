/**
 * Provide a way to iterate for each element in an array while waiting for async functions to finish
 *
 * @param array
 * @param callback
 * @returns {Promise<void>}
 */
async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export default asyncForEach
