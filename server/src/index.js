const Koa = require('koa')
const KoaMount = require('koa-mount')
const KoaRouter = require('koa-router')
const KoaViews = require('koa-views')
const path = require('path')

const CONFIG = require('./config')
const PathUtils = require('./utils/file')

const app = new Koa()

const staticPath = path.resolve('./static')

// console.log(staticPath)
app.use(
  KoaMount(
    '/static',
    require('koa-static')(staticPath, {

    })
  )
)
app.use(
  KoaMount(
    '/_', 
    require('koa-static')(CONFIG.staicPath)
  )
)

app.use(
  KoaViews(
    __dirname + '/views',
    {
      extension: 'pug',
    }
  )
)

app.use(async (ctx, next) => {
  if (ctx.request.url === '/favicon.ico') {
    ctx.body = ''
  } else {
    await next()
  }
})

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

app.use(async (ctx, next) => {
  // pathUrl, title, stats
  let ctxPath = ctx.path
  if (ctxPath[ctxPath.length - 1] !== '/') ctxPath = ctxPath + '/'

  if (ctxPath.indexOf('%') !== -1) ctxPath = decodeURIComponent(ctx.path)
  // ctxPath = decodeURIComponent(ctx.path)
  let staticPath = path.resolve(CONFIG.staicPath, '.' + ctxPath)
  if (ctxPath === '/') staticPath = CONFIG.staicPath

  let statList = []
  let errMessage = ''
  let staticFilePath = '/_' + ctxPath

  if (staticFilePath[staticFilePath.length - 1] !== '/') staticFilePath = staticFilePath + '/'

  try {
    statList = PathUtils.lsStat(staticPath)
      .map(item => {
        const isDir = item.stats.isDirectory()
        return {
          ...item,
          href: isDir ? (ctxPath + item.title) : (staticFilePath + item.title),
          size: parseSize(item.stats.size),
          ext: isDir ? 'Folder' : parseExt(item.title)
        }
      })
  } catch (err) {
    errMessage = err.message
  }
  if (errMessage) {
    await ctx.render('file-error', {
      statList,
      pwd: staticPath,
      errMessage,
    })
    return
  }

  await ctx.render('file', {
    statList,
    pwd: staticPath,
  })
})

app.listen(
  CONFIG.port,
  CONFIG.host,
)

console.log(`server on：http://${CONFIG.host}:${CONFIG.port}`)
