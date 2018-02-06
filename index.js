const Hapi = require('hapi')
const Nunjucks = require('nunjucks')
const Joi = require('joi')

const server = Hapi.Server({
  port: 4500
})

const schema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).meta({type: 'password'}),
})

class Field {
  constructor(key, schema) {
    this.key = key
    this.label = key
    this.schema = schema
    this.type = schema.schemaType
    this.isPassword = schema._meta.length > 0 && schema._meta[0].type === 'password'
    this.required = schema._flags.presence === 'required'
    // console.log(this.schema)
  }

  html(widget) {
    if (widget) {
      return 'widget not implemented'
    } else {
      const type = this.isPassword ? 'password' : 'text'
      return `<input type="${type}" name="${this.key}" value="" required=${this.required}>`
    }
  }

  toString() {
    return `name: ${this.key}, type: ${this.type}, required: ${this.required}`
  }
}

class JoiForm {
  constructor(schema) {
    const keys = Object.keys(schema)
    schema._inner.children.forEach((c) => {
      this[c.key] = new Field(c.key, c.schema)
      // console.log(this[c.key].html())
    })
  }

  update(payload) {
    console.log(payload)
  }

  validate() {
    return false
  }
}

server.register(
  require('vision')
).then(() => {
  const loginForm = new JoiForm(schema)

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
    // relativeTo: __dirname,
    // path: 'examples/nunjucks/templates'
  });

  server.route({
    path: '/',
    method: 'post',
    handler(request, h) {
      loginForm.update(request.payload)
      if (loginForm.validate()) {
        // const result = Joi.validate({
        //   username: 'abc',
        //   password: '123123',
        // }, schema)
        return h.view('index', { loginForm, result: true })
      } else {
        return h.view('index', { loginForm, result: false })
      }
    }
  })

  server.route({
    path: '/',
    method: 'get',
    handler(request, h) {
      // const result = Joi.validate({
      //   username: 'abc',
      //   password: '123123',
      // }, schema)
      return h.view('index', { loginForm })
    }
  })

  server.start()
})
