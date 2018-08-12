const Hapi = require('hapi')
const Nunjucks = require('nunjucks')
const Joi = require('joi')
const { Form, TextInput, TextArea } = require('../joiform')

// hapi server
const server = Hapi.Server({
  port: 4500
})

// server start with yar and nunjucks-template
server.register([{
  plugin: require('yar'),
  options: {
    storeBlank: false,
    cookieOptions: {
      password: 'the-password-must-be-at-least-32-characters-long',
      isSecure: false,
    },
  }
}, {
  plugin: require('vision'),
}]).then(() => {
  // vision with nunjucks-template configuration
  server.views({
    isCached: process.env.NODE_ENV === 'production',
    engines: {
      njk: {
        compile: (src, options) => {
          const template = Nunjucks.compile(src, options.environment)
          return (context) => template.render(context)
        },
        prepare: (options, next) => {
          options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false })
          return next()
        },
      }
    },
    relativeTo: __dirname,
    path: __dirname + '/templates'
  })

  // define a schema
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
      .meta({
        type: 'password'
      }),
    memo: Joi.string().description('You can memo.').allow('')
      .meta({
        widget: TextArea,
      }),
    agree: Joi.bool().default(false).description('agreement'),
  })

  // routes
  server.route({
    path: '/simple',
    method: 'post',
    handler(request, h) {
      const loginForm = new Form(schema)
      loginForm.update(request.payload)
      if (loginForm.validate()) {
        request.yar.flash('success', `received form data successfully.
          <br><br><pre>${JSON.stringify(loginForm.data, null, '  ')}</pre>`)
        return h.redirect('/simple')
      }
      const flashes = {
        warning: [
          'errors occured.'
        ]
      }
      return h.view('simple', { loginForm, flashes })
    }
  })

  server.route({
    path: '/simple',
    method: 'get',
    handler(request, h) {
      const loginForm = new Form(schema)
      const flashes = request.yar.flash()
      return h.view('simple', { loginForm, flashes })
    }
  })

  server.route({
    path: '/',
    method: 'get',
    handler(request, h) {
      const loginForm = new Form(schema)
      const flashes = request.yar.flash()
      return h.view('index', { loginForm, flashes })
    }
  })

  server.start()
  console.log('server started at localhost:4500')
})
