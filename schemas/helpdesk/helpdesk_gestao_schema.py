from marshmallow import fields, Schema
from .helpdesk_schema import HelpdeskValidate

messages = {
    'de': {
        'invalid': 'Formato da data DE deve ser AAAA-MM-DD',
        'required': 'A data DE é requerida',
    },
    'ate': {
        'invalid': 'Formato da data ATE deve ser AAAA-MM-DD',
        'required': 'A data ATE é requerida',
    }
}

class HelpdeskGestaoValidate:

    @staticmethod
    def validate_agent(ids_agent: str):
        for id_agent in ids_agent.split(','):
            HelpdeskValidate.validate_agent(int(id_agent))

    @staticmethod
    def validate_user(ids_user: str):
        for id_user in ids_user.split(','):
            HelpdeskValidate.validate_user(int(id_user))
    
    @staticmethod
    def validate_subject(ids_subject: str):
        for id_subject in ids_subject.split(','):
            HelpdeskValidate.validate_idassunto(int(id_subject))
    
    @staticmethod
    def validate_status(ids_status: str):
        for id_status in ids_status.split(','):
            HelpdeskValidate.validate_idstatus(int(id_status))



class HelpdeskGestaoSchema(Schema):
    de = fields.Date(required=True, error_messages=messages['de'])
    ate = fields.Date(required=True, error_messages=messages['ate'])
    agente = fields.Str(validate=HelpdeskGestaoValidate.validate_agent)
    assunto = fields.Str(validate=HelpdeskGestaoValidate.validate_subject)
    status = fields.Str(validate=HelpdeskGestaoValidate.validate_status)
    usuario = fields.Str(validate=HelpdeskGestaoValidate.validate_user)