import common from '../core/common'
import Render from '../core/render'

module.exports = function Process(req, res) {
  // Get page if exists
  let base = req.baseUrl
  let isContent = false
  let pagePath = null
  let match = null
  if (match = base.match(/^(\/page)\/{0,1}.*$/)) {
    isContent = true
    base = base.substring(match[1].length)
    pagePath = base
  }

  const str = decodeURIComponent(req.path.substring(1))
  let locale = req.locale
  let loca = locale.locale

  let page = req.app.get('pages').find(page => {
    if (page['base'] === base) {
      let regexStr = page['regex'+loca]
      if (regexStr === '') {
        if (str === page[loca])
          return true
      }
      else {
        let regex = new RegExp('^'+regexStr+'$')
        if (regex.exec(str))
          return true
      }
    }
  })
  
  if (!page)
    return false

  // Page exists => proceed
  res.viewLocals = {}
  res.viewLocals['pagePath'] = pagePath
  res.setPost = (post = true) => { res.viewLocals['post'] = post }
  res.setForm = (form = 0) => { res.viewLocals['form'] = form }
  console.log('page', page['name'], isContent)

  let js = page['js']

  let promises = []
  if (js && js.PreLoad)
    promises.push(js.PreLoad(req, res, isContent))
  Promise.all(promises).then(() => {

    locale.setNames(['default', page['name']])

    promises = []
    promises.push(locale.loadPage())
    if (js && js.LoadSync)
      promises.push(js.LoadSync(req, res, isContent))
    Promise.all(promises).then(() => {

      promises = []
      if (js && js.Load)
        promises.push(js.Load(req, res, isContent))
      Promise.all(promises).then(() => {

        Render(req, res, page, isContent)

      }, common.error)
    }, common.error)
  }, common.error)

  return true
}
