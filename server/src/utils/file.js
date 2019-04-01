const fse = require('fs-extra')
const path = require('path')

function ls (relativePath) {
  return fse.readdirSync(relativePath)
}

/**
 * 
 * @param {String} relativePath 文件目录
 * @return {Array} 文件信息列表 
 *  `{pathUrl, title, stats}`
 */
function lsStat (relativePath) {
  const fileNameList = ls(relativePath)
  return fileNameList
    .map(title => {
      const pathUrl = path.resolve(relativePath, title)

      return {
        pathUrl,
        title,
        stats: fse.statSync(pathUrl)
      }
    })
}

module.exports = {
  ls,
  lsStat,
}
