const Joi = require('joi')

class TextInput {

}

class TextArea {

}

class CheckBox {

}

class Field {
  constructor(key, schema) {
    this.key = key
    this.label = key
    this.schema = schema
    this.type = schema.schemaType
    this.value = this.schema._flags.default || ''
    // coerce the boolean type
    if (this.type === 'boolean') {
        this.value = this.schema._flags.default || false
    }
    this.description = schema._description
    this.isPassword = false
    this.widget = undefined
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

  html({ _class, ...attributesObject }) {
    const attributes = {}
    if (_class) {
      attributes.class = _class
    }
    Object.keys(attributesObject).forEach((key) => {
      attributes[key] = attributesObject[key]
    })
    const attributesMap = Object.keys(attributes).map((k) => {
      return ` ${k}="${attributes[k]}"`
    })

    // decide the widget
    if (typeof this.widget === 'undefined') {
      switch (this.type) {
        case 'string':
          this.widget = TextInput
          break
        case 'boolean':
          this.widget = CheckBox
          break
      }
    }

    // draw html
    switch (this.widget) {
      case TextArea:
        return `<textarea name="${this.key}" required=${this.required}${attributesMap.join('')}>${this.value}</textarea>`
      case TextInput:
        const type = this.isPassword ? 'password' : 'text'
        return `<input type="${type}" name="${this.key}" value="${this.value}" required=${this.required}${attributesMap.join('')}>`
      case CheckBox:
        return `<input type="checkbox" name="${this.key}" value="1"${this.value ? ' checked="checked"' : ''}${attributesMap.join('')}>`
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
      // coerce the boolean type
      if (this[k].type === 'boolean') {
        this.__payload[k] = !!this.__payload[k]
      }
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

  get data() {
    return this.__fields
      .map((f) => ({ [f]: this[f].value }))
      .reduce((a, b) => ({ ...a, ...b }))
  }
}

exports.TextInput = TextInput
exports.TextArea = TextArea