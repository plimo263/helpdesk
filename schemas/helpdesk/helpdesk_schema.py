from marshmallow import fields, Schema, validate, ValidationError
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar

messages = {
    'dados': {
        'invalid': 'Dados precisam ser um booleano'
    },
    'dados_estatisticos': {
        'invalid': 'Dados_estatisticos precisam ser um booleano'
    },
    'ordenar': {
        'invalid': 'Os modelos aceitos são asc ou desc',
    },
    'coluna': {
        'invalid': 'As colunas aceitas sao id, solicitante, assunto, agente, status, ultima_interacao, titulo'
    },
    'pagina': {
        'invalid': 'A pagina precisa ser um inteiro'
    },
    'ticket': {
        'invalid': 'O ticket precisa ser um inteiro'
    }
}

def validate_column_order(column: str):
    ''' Verifica as colunas a serem usadas para ordenacao.'''

    if not column in HelpdeskAuxiliar.obter_colunas_ordenaveis().keys():
        raise ValidationError(messages['coluna']['invalid'])


class HelpdeskGetSchema(Schema):
    dados = fields.Bool( error_messages=messages['dados'])
    dados_estatisticos = fields.Bool(error_messages=messages['dados_estatisticos'])
    pagina = fields.Int( error_messages=messages['pagina'])
    ordenar = fields.Str(validate=validate.OneOf(['asc', 'desc'], error=messages['ordenar']['invalid']))
    coluna = fields.Str(validate=validate_column_order)
    ticket = fields.Int(error_messages=messages['ticket'])