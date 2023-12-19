from marshmallow import fields, Schema, validate, ValidationError
from models.config.config_db import ConfigDB
from schemas.success_schema import SuccessSchema

messages = {
    'id': {
        'invalid': 'O id informado não é aceito',
        'required': 'Necessario informar o id da configuracao',
    },
    'name': {
        'invalid': 'O nome deve ter ao menos 2 caracteres',
        'required': 'Necessario informar o parametro name',
    },
    'value': {
        'invalid': 'O parametro value deve ser informado',
        'required': 'Necessario informar o parametro value',
    },
    'description': {
        'invalid': 'O parametro description deve ter ao menos 2 caracteres',
        'required': 'Necessario informar o parametro description',
    },
}

def validate_id_config(id: int):
    if not ConfigDB().config_exists(id=id):
        raise ValidationError(f"A configuração de id {id!r} não existe")

class ConfigHelpdeskIdSchema(Schema):
    id = fields.Int(validate=validate_id_config, error_messages=messages['id'], required = True)


class ConfigHelpDeskFieldsSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, error=messages['name']['invalid']), error_messages=messages['name'], required=True )
    value = fields.Str(validate=validate.Length(min=0, error=messages['value']['invalid']), error_messages=messages['value'], required=True )
    description = fields.Str(validate=validate.Length(min=2, error=messages['description']['invalid']), error_messages=messages['description'], required=True )

class ConfigHelpdeskSchema(ConfigHelpdeskIdSchema, ConfigHelpDeskFieldsSchema):
    pass

class ConfigHelpeskPostSchema(ConfigHelpDeskFieldsSchema, SuccessSchema):
    data = fields.Nested(ConfigHelpdeskSchema)

class ConfigHelpeskPutSchema(ConfigHelpdeskSchema, SuccessSchema):
    data = fields.Nested(ConfigHelpdeskSchema)

class ConfigHelpeskDelSchema(ConfigHelpdeskIdSchema, SuccessSchema):
    pass