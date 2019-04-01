const fsUtils = require('../utils/file')
const CONFIG = require('../config')

console.log(CONFIG.staicPath)
console.log(fsUtils.lsStat(CONFIG.staicPath))
