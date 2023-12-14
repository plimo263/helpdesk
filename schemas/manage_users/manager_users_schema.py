from marshmallow import fields, validate, ValidationError, Schema
from models import User
from schemas.sector.sector_schema import SectorResultSchema, SectorSchema, validator_sector
from schemas.success_schema import SuccessSchema 

messages = {
    'id': {
        'invalid': 'O id informado não existe',
        'required': 'Necessário informar o ID do usuario',
    },
    'name': {
        'invalid': 'O nome deve ter ao menos 2 caracteres',
        'required': 'Necessário informar o nome do usuario',
    },
    'email': {
        'invalid': 'O email informado não é valido',
        'required': 'Necessário informar o email do usuario',
    },
    'is_agent': {
        'invalid': 'O valor esperado é S ou N',
        'required': 'Necessário informar se é um agente',
    },
    'active': {
        'invalid': 'O valor esperado é S ou N',
        'required': 'Necessário informar o status  do usuario',
    },
    'id_sector': {
        'invalid': 'ID do setor não encontrado.',
        'required': 'Necessário informar o setor do usuario',
    },
    'password': {
        'invalid': 'A senha deve ter ao menos 5 caracteres',
        'required': 'Necessário informar a senha.',
    }
}

def validate_user_exists(id: int):
    ''' Verifica se o usuario existe no sistma '''
    if not User.user_exists(id):
        raise ValidationError(messages['id']['invalid'])

class ManagerUserIdSchema(Schema):
    id = fields.Int(validate=validate_user_exists, error_messages=messages['id'], required=True)

class ManagerUserDataSchema(Schema):
    name = fields.Str(validate=validate.Length(min = 2, error=messages['name']['invalid']), error_messages=messages['id'], required=True)
    email = fields.Email(error_messages=messages['email'], required=True)
    password = fields.Str(validate=validate.Length(min = 5, error=messages['password']['invalid']), load_only=True, required=True, error_messages=messages['password'])
    is_agent = fields.Str(validate=validate.OneOf(["S","N"], error=messages['is_agent']['invalid']), error_messages=messages['is_agent'], required=True)
    active = fields.Str(validate=validate.OneOf(["S","N"], error=messages['active']['invalid']), error_messages=messages['active'], required=True)
    id_sector = fields.Int(validate=validator_sector, error_messages=messages['id_sector'], required=True)
    last_login = fields.Str(dump_only=True)
    sector = fields.Nested(SectorResultSchema)

class ManagerUserSchema(ManagerUserIdSchema, ManagerUserDataSchema):
    pass

class ManagerUserPostSchema(ManagerUserDataSchema, SuccessSchema):
    data = fields.Nested(ManagerUserSchema, dump_only=True)

class ManagerUserPutSchema(ManagerUserSchema, SuccessSchema):
    data = fields.Nested(ManagerUserSchema, dump_only=True)

class ManagerUserDelSchema(ManagerUserIdSchema, SuccessSchema):
    pass