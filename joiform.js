const Joi = require('joi')

class TextInput {

}

class TextArea {

}

class Field {
  constructor(key, schema) {
    this.key = key
    this.label = key
    this.schema = schema
    this.value = ''
    this.type = schema.schemaType
    this.isPassword = false
    this.widget = TextInput
    if (schema._meta.length > 0) {
      this.isPassword = schema._meta[0].type === 'password'
      if (schema._meta[0].widget) {
        this.widget = schema._meta[0].widget
      }
    }
    this.required = schema._flags.presence === 'required'
    this.errors = []
  }

  hasErrors() {
    return this.errors.length > 0
  }

  addError(error) {
    this.errors.push(error.message)
  }

  setValue(value) {
    this.value = value
  }

  html({ _class }) {
    const attributes = {}
    if (_class) {
      attributes.class = _class
    }
    const attributesMap = Object.keys(attributes).map((k) => {
      return ` ${k}="${attributes[k]}"`
    })
    switch (this.widget) {
      case TextArea:
        return `<textarea name="${this.key}" required=${this.required}${attributesMap.join('')}>${this.value}</textarea>`
      case TextInput:
      default:
        const type = this.isPassword ? 'password' : 'text'
        return `<input type="${type}" name="${this.key}" value="${this.value}" required=${this.required}${attributesMap.join('')}>`
    }
  }

  toString() {
    return `name: ${this.key}, type: ${this.type}, required: ${this.required}`
  }
}

exports.Form = class Form {
  constructor(schema) {
    this.__error = undefined
    this.__errorCount = 0
    this.__fields = []
    this.__payload = {}
    this.__schema = schema
    const keys = Object.keys(schema)
    schema._inner.children.forEach((c) => {
      this.__fields.push(c.key)
      this[c.key] = new Field(c.key, c.schema)
    })
  }

  update(payload) {
    this.__payload = payload
    Object.keys(this.__payload).forEach((k) => {
      this[k].setValue(this.__payload[k])
    })
  }

  validate() {
    const { error, value } = Joi.validate(this.__payload, this.__schema, {
      abortEarly: false,
    })
    if (error) {
      error.details.forEach((d) => {
        this[d.path[0]].addError(d)
      })
    }
    this.__errorCount = error ? error.details.length : 0
    this.__error = error
    return error === null
  }
}

exports.TextInput = TextInput
exports.TextArea = TextArea