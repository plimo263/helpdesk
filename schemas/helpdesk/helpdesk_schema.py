from typing import Dict, List
from marshmallow import fields, Schema, validate, ValidationError
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from models.user.user_db import UserDB
from db import TicketStatus, TicketAssunto
from routes.utils.bucket_route import BucketAuxiliar

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
    },
    'enviar_email': {
        'invalid': 'Esta propriedade precisa ser false OU true',
        'required': 'A propriedade enviar_email é requerida'
    },
    'titulo': {
        'invalid': 'O titulo precisa ter no mínimo 3 caracteres',
        'required': 'A propriedade titulo é requerida'
    },
    'idstatus': {
        'invalid': 'O status informado não existe',
        'required': 'A propriedade idstatus é requerida'
    },
    'idassunto': {
        'invalid': 'O assunto informado não existe',
        'required': 'A propriedade idassunto é requerida'
    },
    'descricao': {
        'invalid': 'A descrição informada não é uma lista ou não atende ao formato aceito',
        'required': 'A propriedade descricao é requerida'
    },
    'copia_chamado': {
        'invalid': 'Um dos usuários informados na copia não existe no sistema.',
        'required': 'A propriedade copia_chamado é requerida'
    },
    'id_usuario': {
        'invalid': 'O id_usuario enviado não existe no sistema',
        'required': 'A propriedade id_usuario é requerida'
    },
    'arquivo': {
        'invalid': 'O arquivo não foi enviado.',
        'required': 'A propriedade de arquivo é requerida.'
    },
}

def validate_column_order(column: str):
    ''' Verifica as colunas a serem usadas para ordenacao.'''

    if not column in HelpdeskAuxiliar.obter_colunas_ordenaveis().keys():
        raise ValidationError(messages['coluna']['invalid'])

class HelpdeskValidate:

    @staticmethod
    def validate_idstatus(id_status: int):
        ''' Valida o status do sistema, veja se existe '''
        tks: TicketStatus = TicketStatus.query.filter( 
            TicketStatus.id == id_status
        ).first()
        if not tks:
            raise ValidationError(messages['idstatus'])

    @staticmethod
    def validate_idassunto(id_assunto: int):
        ''' Valida o assunto no sistema'''
        tka: TicketAssunto = TicketAssunto.query.filter( 
            TicketAssunto.id == id_assunto
        ).first()
        if not tka:
            raise ValidationError(messages['idassunto'])

    @staticmethod
    def validate_descricao(descricao: List):
        ''' Valida o formato da descricao enviada '''
        if len(descricao) == 0:
            raise ValidationError(messages['descricao']['invalid'])
        
        for item in descricao:
            if not 'children' in item or not 'type' in item:
                raise ValidationError(messages['descricao']['invalid'])

    @staticmethod
    def validate_copia_chamado(list_item: List):
        ''' Valida para ver se todos os ids informados na copia do chamado 
        existem'''

        for item in list_item:
            if not UserDB().user_exists(item):
                raise ValidationError(messages['copia_chamado']['invalid'])

    @staticmethod
    def validate_user(id_user: int):
        ''' Valida o id do usuario que esta abrindo o chamado.'''
        if not UserDB().user_exists(id_user):
            raise ValidationError(messages['id_usuario']['invalid'])
    
    @staticmethod
    def validate_files(file_list: List):
        ''' Valida o envio dos arquivos em anexo'''

        for file_path in file_list:
            if not BucketAuxiliar.file_exists_in_bucket(file_path):
                raise ValidationError(messages['arquivo']['invalid'])


class HelpdeskGetSchema(Schema):
    dados = fields.Bool( error_messages=messages['dados'])
    dados_estatisticos = fields.Bool(error_messages=messages['dados_estatisticos'])
    pagina = fields.Int( error_messages=messages['pagina'])
    ordenar = fields.Str(validate=validate.OneOf(['asc', 'desc'], error=messages['ordenar']['invalid']))
    coluna = fields.Str(validate=validate_column_order)
    ticket = fields.Int(error_messages=messages['ticket'])

class HelpdeskPostSchema(Schema):
    enviar_email = fields.Bool(
        error_messages=messages['enviar_email'], required = True
    )
    titulo = fields.Str(
        error_messages=messages['titulo'], required = True
    )
    idstatus = fields.Int(
        validate=HelpdeskValidate.validate_idstatus, 
        error_messages=messages['idstatus'], required = True
    )
    idassunto = fields.Int(
        validate=HelpdeskValidate.validate_idassunto, 
        error_messages=messages['idassunto'], required = True
    )
    descricao = fields.List(
        fields.Dict(
            keys=fields.Str(),
            values=fields.Raw(),
        ),
        validate=HelpdeskValidate.validate_descricao, 
        error_messages=messages['descricao'], required = True
    )
    copia_chamado = fields.List(
        fields.Int(),
        validate=HelpdeskValidate.validate_copia_chamado, 
        error_messages=messages['copia_chamado'], required = True
    )
    id_usuario = fields.Int(
        validate=HelpdeskValidate.validate_user, 
        error_messages=messages['id_usuario'], required = True
    )
    arquivo = fields.List(
        fields.Str(),
        validate=HelpdeskValidate.validate_files, 
        error_messages=messages['arquivo'], 
        required = True
    )