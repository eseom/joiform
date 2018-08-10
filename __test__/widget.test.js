const Joi = require('joi')
const { Form, TextInput, TextArea } = require('../joiform')

// define a new form
const makeForm = () =>
  new Form(Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required()
      .meta({
        type: 'password',
      }),
    extraField: Joi.string().min(3).max(30),
    memo: Joi.string().min(10).required().description('This is a textarea widget.')
      .meta({
        widget: TextArea,
      }),
    memoOptional: Joi.string().min(10).description('This is a textarea widget.')
      .meta({
        widget: TextArea,
      }),
    agree: Joi.bool().default(false).description('agreement'),
  }))

test('test an input widget 1', () => {
  const aForm = makeForm()

  expect(aForm.username.html())
    .toBe('<input name="username" required="true" type="text" value="">');
  expect(aForm.username.html({ 'data-example': 'example1' }))
    .toBe('<input name="username" required="true" data-example="example1" type="text" value="">');

  expect(aForm.password.html())
    .toBe('<input name="password" required="true" type="password" value="">');
  expect(aForm.password.html({ 'data-example': 'example1' }))
    .toBe('<input name="password" required="true" data-example="example1" type="password" value="">');

  expect(aForm.extraField.html())
    .toBe('<input name="extraField" type="text" value="">');

  expect(aForm.memo.html())
    .toBe('<textarea name="memo" required="true"></textarea>');
  expect(aForm.memo.html({ _class: 'form-control' }))
    .toBe('<textarea name="memo" required="true" class="form-control"></textarea>');
  expect(aForm.memo.html({ _class: 'form-control', id: 'id-memo' }))
    .toBe('<textarea name="memo" required="true" class="form-control" id="id-memo"></textarea>');
  expect(aForm.memoOptional.html({}))
    .toBe('<textarea name="memoOptional"></textarea>');

  expect(aForm.agree.html())
    .toBe('<input type="checkbox" value="1" name="agree">');
  expect(aForm.agree.html({ id: 'id-agree' }))
    .toBe('<input type="checkbox" value="1" name="agree" id="id-agree">');
});

test('validation', () => {
  const aForm = makeForm()

  aForm.update({
    username: 'user',
    password: 'strike',
    memo: 'lorem ipsum',
    agree: true,
  })
  expect(aForm.validate())
    .toBeTruthy()
  expect(aForm.username.hasErrors())
    .toBeFalsy()
  expect(aForm.agree.html({ id: 'id-agree' }))
    .toBe('<input type="checkbox" value="1" checked="checked" name="agree" id="id-agree">');

  aForm.update({
    username: 'p',
    password: 'strike',
    memo: 'lorem ipsum',
    agree: true,
  })
  expect(aForm.validate())
    .toBeFalsy()
  expect(aForm.username.toString())
    .toBe('name: username, type: string, required: true')
  expect(aForm.password.toString())
    .toBe('name: password, type: string, required: true')
  expect(aForm.data)
    .toMatchObject({ username: 'p', memo: 'lorem ipsum', agree: true })
});
