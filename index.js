const Hapi = require('hapi')
const Nunjucks = require('nunjucks')
const Joi = require('joi')
const { Form, TextInput, TextArea } = require('./joiform')

const server = Hapi.Server({
  port: 4500
})

const schema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
    .meta({
      type: 'password'
    }),
  memo: Joi.string().min(3).required()
    .meta({
      widget: TextArea,
    }),
})

server.register(
  require('vision')
).then(() => {
  server.views({
    isCached: false,
    engines: {
      njk: {
        compile: (src, options) => {
          const template = Nunjucks.compile(src, options.environment);
          return (context) => {
            return template.render(context);
          };
        },
        prepare: (options, next) => {
          options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false });
          return next();
        }
      }
    },
  });

  server.route({
    path: '/',
    method: 'post',
    handler(request, h) {
      const loginForm = new Form(schema)
      loginForm.update(request.payload)
      if (loginForm.validate()) {
        return h.redirect('/')
      }
      return h.view('index', { loginForm, result: false })
    }
  })

  server.route({
    path: '/',
    method: 'get',
    handler(request, h) {
      const loginForm = new Form(schema)
      return h.view('index', { loginForm })
    }
  })

  server.start()
})
