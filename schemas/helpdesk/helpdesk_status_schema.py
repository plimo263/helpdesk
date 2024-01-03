import re
from marshmallow import fields, Schema, ValidationError
from db import TicketStatus
from extensions import db
from schemas.success_schema import SuccessSchema


messages = {
    'autorizado_interagir': {
        'invalid': 'Os possiveis valores são A (Agente) ou S (Solicitante)',
        'required': 'O autorizado_interagir é requerido',
    },
    'cor': {
        'invalid': 'A cor somente é valida em Hexadecimal',
        'required': 'A cor é requerida',
    },
    'descricao': {
        'invalid': 'A descrição deve ter ao menos 2 caracteres',
        'required': 'A descrição é requerida',
    },
    'id': {
        'invalid': 'O id do status é invalido ou não existe',
        'required': 'O id é requerido',
    },
    'situacao': {
        'invalid': 'As possíveis situações são B (Inativo) ou A (Ativo)',
        'required': 'A situação é requerida',
    },
    'status_para': {
        'invalid': 'É esperado uma lista de ids de status',
        'required': 'O status_para é requerido',
    }
}

class HelpdeskStatusValidate:

    @staticmethod
    def validate_autorizado_interagir(value: str):
        if not value in ['A', 'S']:
            raise ValidationError(messages['autorizado_interagir']['invalid'])
    
    @staticmethod
    def validate_color(value: str):
        if not re.compile('^#[A-Fa-f0-9]{6}$').match(value):
            raise ValidationError(messages['cor']['invalid'])
    
    @staticmethod
    def validate_description(value: str):
        if len(value) < 2:
            raise ValidationError(messages['descricao']['invalid'])
    
    @staticmethod
    def validate_id(value: int):
        tkt: TicketStatus = db.session.get(TicketStatus, value)
        if not tkt:
            raise ValidationError(messages['id']['invalid'])
    
    @staticmethod
    def validate_status_to(status_list: list):
        for item in status_list:
            HelpdeskStatusValidate.validate_id(item)

    @staticmethod
    def validate_situation(value: str):
        if not value in ['A', 'B']:
            raise ValidationError(messages['situacao']['invalid'])


class HelpdeskStatusBase(Schema):
    autorizado_interagir = fields.Str(validate=HelpdeskStatusValidate.validate_autorizado_interagir, required=True, error_messages=messages['autorizado_interagir'])
    cor = fields.Str(validate=HelpdeskStatusValidate.validate_color, required=True, error_messages=messages['cor'])
    nome = fields.Str(validate=HelpdeskStatusValidate.validate_description, required=True, load_only=True, error_messages=messages['descricao'])
    descricao = fields.Str(dump_only=True)


class HelpdeskStatusId(Schema):
    id_status = fields.Int(validate=HelpdeskStatusValidate.validate_id, required=True, load_only=True, error_messages=messages['id'])
    id = fields.Int(dump_only=True)


class HelpdeskStatusSituation(Schema):
    situacao = fields.Str(validate=HelpdeskStatusValidate.validate_situation, required=True, error_messages=messages['situacao'])


class HelpdeskStatus(HelpdeskStatusBase, HelpdeskStatusId, HelpdeskStatusSituation):
    pass


class HelpdeskStatusGetSchema(HelpdeskStatus):
    status_para = fields.List(fields.Nested(HelpdeskStatus))


class HelpdeskStatusPostSchema(HelpdeskStatusBase, SuccessSchema):
    data = fields.Nested(HelpdeskStatus)


class HelpdeskStatusPutSchema(
    HelpdeskStatusId, HelpdeskStatusBase, 
    HelpdeskStatusSituation, SuccessSchema
):
    data = fields.Nested(HelpdeskStatus)


class HelpdeskStatusPatchSchema(HelpdeskStatusId, SuccessSchema):
    status_para = fields.List(
        fields.Int(), 
        validate=HelpdeskStatusValidate.validate_status_to, 
        required=True, error_messages=messages['status_para']
    )
    data = fields.Nested(HelpdeskStatusGetSchema)

class HelpdeskStatusDeleteSchema(HelpdeskStatusId, SuccessSchema):
    pass