const Koa = require('koa')
const KoaMount = require('koa-mount')
const KoaRouter = require('koa-router')
const KoaViews = require('koa-views')
const path = require('path')

const CONFIG = require('./config')
const PathUtils = require('./utils/file')

const {
  parseSize,
  parseExt,
  joinPath,
} = require('./utils')

const app = new Koa()

const staticPath = path.resolve('./static')

app.use(
  KoaMount(
    '/static',
    require('koa-static')(staticPath, {})
  )
)
const STATIC_FILE_SERVER_PATH = process.env.STATIC_SERVE_PATH || CONFIG.staicPath
console.log('STATIC_FILE_SERVER_PATH: ', STATIC_FILE_SERVER_PATH)

app.use(
  KoaMount(
    '/_', 
    require('koa-static')(STATIC_FILE_SERVER_PATH)
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

app.use(async (ctx, next) => {
  // pathUrl, title, stats
  let ctxPath = ctx.path

  if (ctxPath.indexOf('%') !== -1) ctxPath = decodeURIComponent(ctx.path)
  let staticPath = path.resolve(STATIC_FILE_SERVER_PATH, '.' + ctxPath)
  if (ctxPath === '/') staticPath = STATIC_FILE_SERVER_PATH

  let statList = []
  let errMessage = ''
  let staticFilePath = '/_' + ctxPath

  try {
    statList = PathUtils.lsStat(staticPath)
      .map(item => {
        const isDir = item.stats.isDirectory()
        return {
          ...item,
          href: isDir ? joinPath(ctxPath, item.title) : joinPath(staticFilePath, item.title),
          size: parseSize(item.stats.size),
          ext: isDir ? 'Folder' : parseExt(item.title)
        }
      })
  } catch (err) {
    errMessage = err.message
  }
  
  statList.unshift(
    {
      title: '../',
      href: joinPath(ctxPath, '../'),
      ext: 'Folder',
      size: 0,
    }
  )
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
