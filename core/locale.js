import pug from 'pug'
import common from '../core/common'

const _loc = { fr:0, en:1 }

let locale = {}

locale.load = function (db) {
  this.db = db
}

locale.setLocale = function(locale) {
  this.locale = locale
  this.loc = _loc[locale]
}

locale.setNames = function(names) {
  if (!Array.isArray(names))
    names = [ names ]
  this.names = names
}

locale.loadPage = function(callback, ...args) {
  return new Promise((resolve, reject) => {
    let loadContent = []
    this.names.forEach(name => {
      loadContent.push(this.loadContent(name))
    })
    Promise.all(loadContent).then(() => {
      resolve()
    }, common.error)
  })
}

locale.isContentLoaded = function(name) {
  if (!name)
    return true
  return this.loaded.includes(name)
}

locale.loadContent = function(name, force = false) {
  return new Promise((resolve, reject) => {
    if (!this.isContentLoaded(name) || force) {
      Promise.all([
        this.loadPage_t(name),
        this.loadPage_txt(name)
      ]).then(() => {
        this.loadPage_pug(name).then(() => {
          if (!name)
            this.fullLoaded = true
          else if (!this.isContentLoaded(name))
            this.loaded.push(name)
          resolve()
        }, common.error)
      }, common.error)
    }
    else
      resolve()
  })
}

locale.loadPage_t = function(name) {
  return new Promise((resolve, reject) => {
    name = name === 'default' ? '' : name
    let query = 'SELECT page, name, fr, en FROM '+this.db.prefix+'locale_t'+(name ? ' WHERE page=\''+name+'\'' : '')
    this.db.query(query, function(err, rows, fields) {
      if (err) reject(err);
      rows.forEach(row => {
        let _page = row['page'] === '' ? 'default' : row['page'], _name = row['name']
        this._t[_page] = this._t[_page] || {}
        this._t[_page][_name] = this._t[_page][_name] || {}
        this._t[_page][_name]['fr'] = row['fr']
        this._t[_page][_name]['en'] = row['en']
       })
       resolve()
    }.bind(this))
  })
}

locale.loadPage_txt = function(name) {
  return new Promise((resolve, reject) => {
    name = name === 'default' ? '' : name
    let query = 'SELECT page, name, fr, en FROM '+this.db.prefix+'locale_txt'+(name ? ' WHERE page=\''+name+'\'' : '')
    this.db.query(query, function(err, rows, fields) {
      if (err) reject(err);
      rows.forEach(row => {
        let _page = row['page'] === '' ? 'default' : row['page'], _name = row['name']
        this._txt[_page] = this._txt[_page] || {}
        this._txt[_page][_name] = this._txt[_page][_name] || {}
        this._txt[_page][_name]['fr'] = row['fr']
        this._txt[_page][_name]['en'] = row['en']
       })
       resolve()
    }.bind(this))
  })
}

locale.loadPugLocale = function(pattern, container, locale, page) {
  return new Promise((resolve, reject) => {
    let locals = {
      t: this,
      locale: locale, page: page,
      dis: {
        locale: locale, page: page,
      }
    }
    pug.render(pattern, locals, (err, html) => {
      if (err) {
        //catch error
        console.log(err)
        container[locale] = null
      } else {
        container[locale] = html
      }
      resolve()
    })
  })
}

locale.loadPage_pug = function(name) {
  return new Promise((resolve, reject) => {
    name = name === 'default' ? '' : name
    let query = 'SELECT page, name, fr, en FROM '+this.db.prefix+'locale_pug'+(name ? ' WHERE page=\''+name+'\'' : '')
    this.db.query(query, function(err, rows, fields) {
      if (err) reject(err);
        var promises = []
      rows.forEach(row => {
        let _page = row['page'] === '' ? 'default' : row['page'], _name = row['name']
        this._pug[_page] = this._pug[_page] || {}
        this._pug[_page][_name] = this._pug[_page][_name] || {}
		this._pug[_page][_name]['fr'] = null
		this._pug[_page][_name]['en'] = null
        promises.push(this.loadPugLocale(row['fr'], this._pug[_page][_name], 'fr', _page))
        promises.push(this.loadPugLocale(row['en'], this._pug[_page][_name], 'en', _page))
      })
      Promise.all(promises).then(() => {
        resolve()
      }, common.error)
    }.bind(this))
  })
}

locale.t = function (str, self = null) {
  let locale = self ? self.locale : this.locale
  if (!locale) return ''
  let t = ''
  let names = self ? [ 'default', self.page ] : this.names
  names.forEach(name => {
    if (this._t[name])
    if (this._t[name][str])
    if (this._t[name][str][locale])
      t = this._t[name][str][locale]
  })
  return t
}

locale.txt = function (str, self = null) {
  let locale = self ? self.locale : this.locale
  if (!locale) return ''
  let t = ''
  let names = self ? [ 'default', self.page ] : this.names
  names.forEach(name => {
    if (this._txt[name])
    if (this._txt[name][str])
    if (this._txt[name][str][locale])
      t = this._txt[name][str][locale]
  })
  return t
}

locale.pug = function (str, self = null) {
  let locale = self ? self.locale : this.locale
  if (!locale) return ''
  let t = ''
  let names = self ? [ 'default', self.page ] : this.names
  names.forEach(name => {
    if (this._pug[name])
      if (this._pug[name][str])
        if (this._pug[name][str][locale])
          t = this._pug[name][str][locale]
  })
  return t
}

locale.getPageLink = function(name, title = null, self = null) {
  let locale = self ? self.locale : this.locale
  if (!locale) return ''
  let page = this.pages_by_name[name]
  if (page) {
    let pagePath = page['url'+locale]
    if (!title)
      title = this.t('menu-'+name, self)
    if (!title)
      title = this.t('title-'+name, self)
    return pug.render('a.loadpage(href=\''+pagePath+'\', page-path=\''+pagePath+'\') '+title)
  }
  return ''
}

locale.getToogleDivLink = function(name, div) {
  return pug.render('li: a(href=\'#\', toogle-div=\''+div+'\') '+this.t(name))
}

locale._t = {}
locale._txt = {}
locale._pug = {}
locale.loaded = []
locale.fullLoaded = false
locale.db = null

module.exports = locale
