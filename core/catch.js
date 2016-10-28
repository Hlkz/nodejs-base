module.exports = function(app) {
//start

app.use('/test', (req, res, next) => {
  res.render('test')
  //next()
})

app.use('/admin/locales', (req, res, next) => {
  app.get('locale').loadContent(null, true).then(() => {
  })
  console.log('Resetting locales')
  res.end()
  //next()
})

//end
}
