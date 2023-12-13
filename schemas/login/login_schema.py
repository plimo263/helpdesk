from marshmallow import fields, Schema, validate

messages = {
    'username': {
        'invalid': '* Esperado endereço de email',
        'required': '* Favor informar o usuário',
    },
    'password': {
        'invalid': '* Senha não foi informada',
        'required': '* Senha não foi informada',
    },
}

class LoginSchema(Schema):
    ''' Realiza o login relacionado ao schema '''
    username = fields.Email(load_only = True, error_messages=messages['username'], required = True)
    password = fields.Str(load_only = True, error_messages=messages['username'], required = True)
    sucesso = fields.Str(dump_only = True)
