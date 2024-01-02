from marshmallow import fields, Schema, validate, ValidationError
from schemas.success_schema import SuccessSchema
from db import TicketAssunto
from extensions import db

messages = {
    'nome': {
        'invalid': 'O nome deve ter ao menos 2 caracteres',
        'required': 'O nome é requerido'
    },
    'prazo': {
        'invalid': 'O prazo deve ser maior que 0',
        'required': 'O prazo é requerido'
    },
    'situacao': {
        'invalid': 'A situação deve ser A ou B',
        'required': 'A situação é requerida'
    },
    'id_assunto': {
        'invalid': 'O id do assunto não foi encontrado',
        'required': 'O id do assunto é requerido'
    }
}

class HelpdeskAssuntoValidate:

    @staticmethod
    def validate_id_assunto(id_assunto: int):
        ''' valida o id do assunto'''
        tkt: TicketAssunto = db.session.get(TicketAssunto, id_assunto)
        if not tkt:
            raise ValidationError(messages['id_assunto']['invalid'])

class HelpdeskAssuntoIdAssuntoSchema(Schema):
    id_assunto = fields.Int(validate=HelpdeskAssuntoValidate.validate_id_assunto, required=True, error_messages=messages['id_assunto'])

class HelpdeskAssuntoSituacaoSchema(Schema):
    situacao = fields.Str(validate=validate.OneOf(['A','B'], error=messages['situacao']['invalid']), required=True, error_messages=messages['situacao'])

class HelpdeskAssuntoNomePrazoSchema(Schema):
    nome = fields.Str(validate=validate.Length(min=3, error=messages['nome']['invalid']), required=True, error_messages=messages['nome'] )
    prazo = fields.Int(validate=validate.Range(min=1, error=messages['prazo']['invalid']), required=True, error_messages=messages['prazo'])

class HelpdeskAssuntoSchema(Schema):
    id = fields.Int()
    prazo = fields.Int()
    descricao = fields.Str()
    situacao = fields.Str()

class HelpdeskAssuntoPostSchema(HelpdeskAssuntoNomePrazoSchema, SuccessSchema):
    data = fields.Nested(HelpdeskAssuntoSchema)

class HelpdeskAssuntoPutSchema(HelpdeskAssuntoIdAssuntoSchema, 
        HelpdeskAssuntoNomePrazoSchema, HelpdeskAssuntoSituacaoSchema, SuccessSchema
):
    data = fields.Nested(HelpdeskAssuntoSchema)

class HelpdeskAssuntoDelSchema(HelpdeskAssuntoIdAssuntoSchema, SuccessSchema):
    pass