const Joi = require('joi')
const { Form, TextInput, TextArea } = require('../joiform')

// define a new form
const makeForm = () => {
  return new Form(Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    memo: Joi.string().min(10).required().description('This is a textarea widget.')
      .meta({
        widget: TextArea,
      }),
    agree: Joi.bool().default(false).description('agreement'),
  }))
}

test('test an input widget 1', () => {
  const aForm = makeForm()

  expect(aForm.username.html())
    .toBe('<input name="username" required="true" type="text" value="">');
  expect(aForm.username.html({ 'data-example': 'example1' }))
    .toBe('<input name="username" required="true" data-example="example1" type="text" value="">');

  expect(aForm.memo.html())
    .toBe('<textarea name="memo" required="true"></textarea>');
  expect(aForm.memo.html({ _class: 'form-control' }))
    .toBe('<textarea name="memo" required="true" class="form-control"></textarea>');
  expect(aForm.memo.html({ _class: 'form-control', id: 'id-memo' }))
    .toBe('<textarea name="memo" required="true" class="form-control" id="id-memo"></textarea>');

  expect(aForm.agree.html())
    .toBe('<input type="checkbox" value="1" name="agree">');
  expect(aForm.agree.html({ id: 'id-agree' }))
    .toBe('<input type="checkbox" value="1" name="agree" id="id-agree">');
});

test('validation', () => {
  const aForm = makeForm()

  aForm.update({
    username: 'username1',
    memo: 'lorem ipsum',
    agree: true,
  })
  expect(aForm.validate())
    .toBeTruthy()
});

