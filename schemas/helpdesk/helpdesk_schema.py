from typing import Dict, List
from marshmallow import fields, Schema, validate, ValidationError
from schemas.success_schema import SuccessSchema
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from models.user.user_db import UserDB
from extensions import db
from db import TicketStatus, TicketAssunto, Ticket
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
    'id_agente': {
        'invalid': 'O agente enviado é invalido.',
        'required': 'O agente enviado é requerido.'
    },
    'id_ticket': {
        'invalid': 'O ticket enviado não existe',
        'required': 'O id do ticket é requerido.'
    },
    'atrasado': {
        'invalid': 'Atrasado precisa ser true ou false',
        'required': 'Atrasado é requerido'
    }
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
    
    @staticmethod
    def validate_agent(id_agent: int):
        ''' Verifica se o agente existe '''
        agent_list = [ row['id_usuario'] for row in  HelpdeskAuxiliar.obter_agentes()]
        if not int(id_agent) in agent_list:
            raise ValidationError(messages['id_agente']['invalid'])
    
    @staticmethod
    def validate_ticket(id_ticket: int):
        ''' Verifica se o ticket existe '''

        tkt = db.session.get(Ticket, id_ticket)
        if not tkt:
            raise ValidationError(messages['id_ticket']['invalid'])


class HelpdeskTicketSchema(Schema):
    agente = fields.Str()
    assunto = fields.Str()
    atrasado = fields.Bool()
    avatar = fields.Str()
    email = fields.Email()
    id = fields.Int()
    id_usuario = fields.Int()
    prazo = fields.Str()
    solicitante = fields.Str()
    status = fields.Str()
    titulo = fields.Str()
    ultima_interacao = fields.Str()

class HelpdeskGetSchema(Schema):
    dados = fields.Bool( error_messages=messages['dados'])
    dados_estatisticos = fields.Bool(error_messages=messages['dados_estatisticos'])
    pagina = fields.Int( error_messages=messages['pagina'])
    ordenar = fields.Str(validate=validate.OneOf(['asc', 'desc'], error=messages['ordenar']['invalid']))
    coluna = fields.Str(validate=validate_column_order)
    ticket = fields.Int(error_messages=messages['ticket'])

class HelpdeskPostSchema(SuccessSchema):
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
    data = fields.Nested(HelpdeskTicketSchema, dump_only=True)

class HelpdeskIdTicketSchema(Schema):
    id_ticket = fields.Int(
        validate=HelpdeskValidate.validate_ticket, 
        error_messages=messages['id_ticket'], required = True
    )

class HelpdeskPatchSchema(HelpdeskIdTicketSchema, SuccessSchema):
    id_agente = fields.Int(
        validate=HelpdeskValidate.validate_agent, 
        error_messages=messages['id_agente'], required = True
    )
    data = fields.Nested(HelpdeskTicketSchema, dump_only=True)

class HelpdeskPutSchema(HelpdeskIdTicketSchema, SuccessSchema):
    enviar_email = fields.Bool(
        error_messages=messages['enviar_email'], required = True
    )
    arquivo = fields.List(
        fields.Str(),
        validate=HelpdeskValidate.validate_files, 
        error_messages=messages['arquivo'], 
        required = True
    )
    idstatus_de = fields.Int(
        validate=HelpdeskValidate.validate_idstatus, 
        error_messages=messages['idstatus'], required = True
    )
    idstatus_para = fields.Int(
        validate=HelpdeskValidate.validate_idstatus, 
        error_messages=messages['idstatus'], required = True
    )
    descricao = fields.List(
        fields.Dict(
            keys=fields.Str(),
            values=fields.Raw(),
        ),
        validate=HelpdeskValidate.validate_descricao, 
        error_messages=messages['descricao'], required = True
    )
    data = fields.Nested(HelpdeskTicketSchema, dump_only=True)


class HelpdeskFiltroValidate:

    @staticmethod
    def validate_status(status: str):
        for id_status in status.split(','):
            HelpdeskValidate.validate_idstatus(id_status)
    
    @staticmethod
    def validate_ticket(ticket: str):
        for id_ticket in ticket.split(','):
            HelpdeskValidate.validate_ticket(id_ticket)
    
    @staticmethod
    def validate_assunto(assunto: str):
        for id_assunto in assunto.split(','):
            HelpdeskValidate.validate_idassunto(id_assunto)
    
    @staticmethod
    def validate_usuario(usuario: str):
        for id_usuario in usuario.split(','):
            HelpdeskValidate.validate_user(id_usuario)
    
    @staticmethod
    def validate_agent(agent: str):
        for id_agent in agent.split(','):
            HelpdeskValidate.validate_agent(id_agent)


class HelpdeskFiltroSchema(Schema):
    id_ticket = fields.Str(validate=HelpdeskFiltroValidate.validate_ticket, error_messages=messages['id_ticket'])
    assunto  = fields.Str(validate=HelpdeskFiltroValidate.validate_assunto, error_messages=messages['idassunto'])
    solicitante = fields.Str(validate=HelpdeskFiltroValidate.validate_usuario, error_messages=messages['id_usuario'])
    agente = fields.Str(validate=HelpdeskValidate.validate_agent, error_messages=messages['id_agente'])
    status  = fields.Str(validate=HelpdeskFiltroValidate.validate_status, error_messages=messages['idstatus'])
    atrasado = fields.Bool( error_messages=messages['atrasado'])

