from marshmallow import fields, Schema, validate

messages = {
    'name': {
        'invalid': ' Nome deve ter ao menos 3 caracteres',
        'required': 'O nome é requerido'
    },
    'password': {
        'invalid': 'A senha enviada tem menos que 5 caracteres',
        'required': 'A senha é requerida é requerido'
    },
    'new_password': {
        'invalid': 'A senha enviada tem menos que 5 caracteres',
        'required': 'A senha é requerida é requerido'
    },
    'avatar': {
        'invalid': 'O avatar não foi enviado',
        'required': 'O avatar é requerido'
    },
}

class ProfileNameSchema(Schema):
    name = fields.Str(validate=validate.Length(min=3, error=messages['name']['invalid']), error_messages=messages['name'], required=True )

class ProfilePasswordSchema(Schema):
    password = fields.Str(validate=validate.Length(min=5, error=messages['password']['invalid']), error_messages=messages['password'], required=True )
    new_password = fields.Str(validate=validate.Length(min=5, error=messages['new_password']['invalid']), error_messages=messages['new_password'], required=True )

class ProfileAvatarSchema(Schema):
    avatar = fields.Str(validate=validate.Length(min=3, error=messages['avatar']['invalid']), error_messages=messages['avatar'], required=True )

