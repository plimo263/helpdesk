from marshmallow import fields, Schema, validate, ValidationError
from models import Sector
from schemas.success_schema import SuccessSchema

messages = {
    'id': {
        'invalid': 'O setor informado não existe',
        'required': 'Precisa informar o id do setor',
    },
    'name': {
        'invalid': 'O nome do setor deve ter ao menos 2 caracteres',
        'required': 'Precisa informar o nome do setor',
    },
    'situation': {
        'invalid': 'A situacao deve ser A ou B',
        'required': 'Precisa informar a situacao',
    }
}

def validator_sector(id: int):
    ''' Verifica se o setor existe'''
    if not Sector.sector_exists(id):
        raise ValidationError('O setor informado não existe no sistema')


class SectorIdSchema(Schema):
    id = fields.Int(validate=validator_sector, error_messages=messages['id'], required = True)

class SectorSchema(Schema):
    name = fields.Str(validate=validate.Length(min = 2, error=messages['name']['invalid']), error_messages=messages['name'], required= True)
    situation = fields.Str(validate=validate.OneOf(['A', 'B'], error=messages['situation']['invalid']), error_messages=messages['situation'], required= True)

class SectorResultSchema(SectorIdSchema, SectorSchema):
    pass

class SectorPutSchema(SectorResultSchema):
    data = fields.Nested(SectorResultSchema)

class SectorPostSchema(SectorSchema):
    data = fields.Nested(SectorResultSchema)


class SectorDelSchema(SectorIdSchema, SuccessSchema):
    pass
