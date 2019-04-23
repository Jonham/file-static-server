const path = require('path')

// utils
function parseSize (sizeNum) {
  if (sizeNum < 1024) return sizeNum + ' B'
  if (sizeNum < Math.pow(1024, 2)) return (sizeNum / Math.pow(1024, 1)).toFixed(2) + ' KiB'
  if (sizeNum < Math.pow(1024, 3)) return (sizeNum / Math.pow(1024, 2)).toFixed(2) + ' MiB'
  if (sizeNum < Math.pow(1024, 4)) return (sizeNum / Math.pow(1024, 3)).toFixed(2) + ' GiB'
  if (sizeNum < Math.pow(1024, 5)) return (sizeNum / Math.pow(1024, 4)).toFixed(2) + ' TiB'
  if (sizeNum < Math.pow(1024, 6)) return (sizeNum / Math.pow(1024, 5)).toFixed(2) + ' PiB'
}

function parseExt (fileName) {
  const d = path.parse(fileName)
  return d.ext.substr(1)
}
/**
 * @param {String} parentPath
 * @param {String} childPath
 */
function joinPath (parentPath, childPath) {
  if (!parentPath) throw new Error('parameter must be given.')
  if (!childPath) return parentPath

  const parentLastSlash = parentPath[parentPath.length - 1] === '/'
  const childFirstSlash = childPath[0] === '/'
  if (
    (parentLastSlash && !childFirstSlash) ||
    (!parentLastSlash && childFirstSlash)
  ) {
    return parentPath + childPath
  }

  if (parentLastSlash && childFirstSlash) return parentPath + childPath.substr(1)
  return parentPath + '/' + childPath
}

/**
 * @param {String} pathStr
 */
function isRoot (pathStr) {
  return pathStr === '/'
}

module.exports = {
  parseSize,
  parseExt,
  joinPath,
  isRoot,
}
