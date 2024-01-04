from marshmallow import fields, Schema, ValidationError
from schemas.helpdesk.helpdesk_schema import HelpdeskValidate
from schemas.success_schema import SuccessSchema


messages = {
    'copia_chamado': {
        'invalid': 'Um dos usuários informados na copia não existe no sistema.',
        'required': 'A propriedade copia_chamado é requerida'

    },
    'id_ticket': {
        'invalid': 'O ticket enviado não existe',
        'required': 'O id do ticket é requerido.'
    }
}

class HelpdeskCopyUsersSchema(Schema):
    id_usuario = fields.Int()
    avatar = fields.Str()
    nome = fields.Str()
    email = fields.Email()


class HelpdeskEnvolvidosSchema(SuccessSchema):
    copia_chamado = fields.List(
        fields.Int(),
        validate=HelpdeskValidate.validate_copia_chamado, 
        error_messages=messages['copia_chamado'], required = True
    )
    id_ticket = fields.Int(
        validate=HelpdeskValidate.validate_ticket, 
        error_messages=messages['id_ticket'], required = True
    )
    data = fields.List(fields.Nested(HelpdeskCopyUsersSchema), dump_only=True)