import json
from datetime import datetime
from operator import itemgetter
from typing import Dict, List
from sqlalchemy import and_
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required, current_user
from db import Ticket, TicketAssunto, TicketStatus
from decorators.is_agent import is_agent
from models.user.user_db import UserDB
from models import User
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from routes.helpdesk.helpdesk_query import HelpdeskQueryData, HelpdeskQueryDataPage, HelpdeskQueryDataStatistics, HelpdeskQueryDataTicket
from routes.utils.bucket_route import BucketAuxiliar
from schemas.helpdesk.helpdesk_envolvidos_schema import HelpdeskEnvolvidosSchema
from schemas.helpdesk.helpdesk_schema import HelpdeskFiltroSchema, HelpdeskGetSchema, HelpdeskPatchSchema, HelpdeskPostSchema, HelpdeskPutSchema, HelpdeskTicketSchema


CAMINHO_SALVAR_ANEXO_HELPDESK = '/dados/static/helpdesk'

STATUS_RESOLVIDO = 3
STATUS_ENCERRADO = 2

blp = Blueprint('helpdesk_api', __name__, description = 'Manutenção Helpdesk')


@blp.route('/helpdesk')
class HelpdeskView(MethodView):
    
    @login_required
    @blp.arguments(HelpdeskGetSchema, location='query')
    def get(self, item_data):
        ''' Retorna dados relacionados ao Helpdesk baseado no filtro enviado.'''

        if 'dados' in item_data:
            hq = HelpdeskQueryData()
            return hq.get_data_query()

        if 'dados_estatisticos' in item_data:
            hq = HelpdeskQueryDataStatistics()
            return hq.get_data_query()

        if 'pagina' in item_data:
            order = item_data['ordenar'] if 'ordenar' in item_data else None
            column = item_data['coluna'] if 'coluna' in item_data else None
            hq = HelpdeskQueryDataPage(item_data['pagina'], order, column)
            return hq.get_data_query()
        
        if 'ticket' in item_data:
            hq = HelpdeskQueryDataTicket(item_data['ticket'])
            return hq.get_data_query()

    @login_required
    @blp.arguments(HelpdeskPostSchema)
    @blp.response(200, HelpdeskPostSchema)
    def post(self, item_data):
        ''' Registra um novo chamado no sistema do helpdesk.'''
        
        enviar_email, id_usuario, idassunto, titulo, idstatus, descricao, copia_chamado, anexos = itemgetter(
            'enviar_email', 'id_usuario', 'idassunto', 
            'titulo', 'idstatus', 'descricao', 'copia_chamado',
            'arquivo',
        )(item_data)

        copia_chamado = list( set(copia_chamado) )
        
        # Crie o chamado
        helpdesk = HelpdeskAuxiliar.add_helpdesk(id_usuario, idassunto, titulo, idstatus )

        nova_descricao = json.dumps(HelpdeskAuxiliar.obter_descricao_formatada(descricao), ensure_ascii=False)

        interaction = HelpdeskAuxiliar.add_interaction(helpdesk['id'], id_usuario, nova_descricao, idstatus, is_first = True)
        #
        lista_emails = { 
            reg.email for reg in  UserDB().get_all_with_user() 
            if not reg.email is None and len(reg.email) > 0 and (reg.id in copia_chamado or reg.id == id_usuario)
        }

        list_of_copys = list(set([id_usuario] + [ id_usuario_copia for id_usuario_copia in copia_chamado ]))

        HelpdeskAuxiliar.add_copy_to_helpdesk(helpdesk['id'], list_of_copys)

        if len(anexos) > 0:
            for anexo in anexos:
                BucketAuxiliar.move_bucket_to_man_folder(
                    anexo,
                    CAMINHO_SALVAR_ANEXO_HELPDESK,
                )
                HelpdeskAuxiliar.save_attach_file(helpdesk['id'], interaction['id_interacao'], anexo)
        
        ticket_reg = HelpdeskAuxiliar.get_helpdesk_list( ( Ticket.id == helpdesk['id'], ) )[0]

        agentes = HelpdeskAuxiliar.obter_agentes()

        lista_emails = list( 
            set(list( lista_emails ) + list({ 
                reg['email'] for reg in agentes 
                if not reg['email'] is None and len(reg['email']) > 0 
            }))
        )

        # Enviar email
        titulo_mensagem = 'Ticket #{} [{}]'.format( helpdesk['id'], titulo )

        msg = 'Chamado inserido com sucesso.'
        if len(lista_emails) > 0 and enviar_email:
            print(lista_emails)
            try:
                HelpdeskAuxiliar.enviar_email_helpdeskV2(
                    lista_emails, titulo_mensagem, helpdesk['id']
                )
            except Exception as err:
                msg += "Mas teve algum problema para enviar o email."

        return {
            'sucesso': msg,
            'data': ticket_reg
        }
    
    @is_agent
    @blp.arguments(HelpdeskPatchSchema)
    @blp.response(200, HelpdeskPatchSchema)
    def patch(self, item_data):
        ''' Altera o responsavel (agente) pelo chamado.'''

        id_agent = item_data['id_agente']
        id_ticket = item_data['id_ticket']

        if not HelpdeskAuxiliar.is_agent(id_agent):
            return abort(400, message='Este usuário não esta apto a receber chamados')

        try:
            HelpdeskAuxiliar.update_agent_ticket(id_ticket, id_agent)
        except Exception as err:
            return abort(400, message='O ticket não existe ou ocorreu algum problema para atualizar o agente')

        return {
            'sucesso': 'Ticket atribuido ao agente com sucesso',
            'data': HelpdeskAuxiliar.get_helpdesk_list( ( Ticket.id == id_ticket, ) )[0]
        }
    
    @login_required
    @blp.arguments(HelpdeskPutSchema)
    @blp.response(200, HelpdeskPutSchema)
    def put(self, item_data):
        ''' Interativiadade sobre o ticket '''
        user: User = current_user

        # Verifica se tem anexos e os insere
        anexos = []
        enviar_email, id_ticket, idstatus_de, idstatus_para, descricao, anexos = itemgetter(
            'enviar_email', 'id_ticket', 
            'idstatus_de', 'idstatus_para', 'descricao', 'arquivo'
        )(item_data)

        is_agent_helpdesk = HelpdeskAuxiliar.is_agent(user.id)

        if not is_agent_helpdesk:
            # A (Agente), S (Solicitante)
            is_interact = [ 
                item for item in  HelpdeskAuxiliar.get_status() 
                if item['id'] == idstatus_de and item['autorizado_interagir'] == 'S'
            ]
            if len(is_interact) == 0:
                return abort(400, message='Você não esta autorizado a interagir neste ticket no status atual dele')
        
        _ticket_registro = HelpdeskAuxiliar.get_helpdesk_list((Ticket.id == id_ticket,))

        if not is_agent_helpdesk:
            if _ticket_registro[0]['id_usuario'] != user.id:
                return abort(400, message='O ticket mencionado não pertence ao seu usuário não pode interagir')

        nova_descricao = json.dumps(HelpdeskAuxiliar.obter_descricao_formatada(descricao), ensure_ascii=False)

        # Se o status de e o para forem iguais então isto é um incremento de informação. 
        # Não Necessita validacao de alteração de status
        if idstatus_de != idstatus_para:
            # Precisa validar o ticket
            if not HelpdeskAuxiliar.is_status_of_to(idstatus_de, idstatus_para):
                return abort(400, message='Não é permitido atualização entre estes status')

        tkt: Ticket = Ticket.query.filter(Ticket.id == id_ticket).first()

        interaction = HelpdeskAuxiliar.add_interaction(
            id_ticket, user.id, nova_descricao, 
            idstatus_de, idstatus_para
        )

        # Verifica se tem anexo e salva
        if len(anexos) > 0:
            for anexo in anexos:
                BucketAuxiliar.move_bucket_to_man_folder(
                    anexo,
                    CAMINHO_SALVAR_ANEXO_HELPDESK,
                )
                HelpdeskAuxiliar.save_attach_file(tkt.id, interaction['id_interacao'], anexo)

        # Por fim é atualizar o status. Se for agente atualiza para o agente em questão
        if is_agent_helpdesk:
            HelpdeskAuxiliar.update_agent_ticket(tkt.id, user.id)
        
        HelpdeskAuxiliar.update_status(tkt.id, idstatus_para)

        if idstatus_para in [ STATUS_RESOLVIDO, STATUS_ENCERRADO]:
            HelpdeskAuxiliar.ticket_finish(tkt.id)

        # Obter o ticket
        ticket_registro = HelpdeskAuxiliar.get_helpdesk_list( ( Ticket.id == id_ticket, ) )[0]

        # obter historico do ticket onde conseguimos os envolvidos
        ticket_historico = HelpdeskAuxiliar.obter_detalhes_ticket(id_ticket)

        # Participantes do chamado
        lista_emails = { reg['email'] 
            for reg in  ticket_historico['envolvidos'] 
            if not reg['email'] is None and len(reg['email']) > 0 
        }
        # Pega o dados do agente responsavel
        agente_responsavel = {
            'id_usuario': ticket_historico['id_agente'],
        }
        lista_emails = list(lista_emails) + list({
            reg['email'] 
            for reg in  HelpdeskAuxiliar.obter_agentes() 
            if not reg['email'] is None and reg['id_usuario'] == agente_responsavel['id_usuario'] 
        })
        
        titulo = ticket_historico['titulo']
        # Enviar email e mensagem
        titulo_mensagem = 'Ticket #{} [{}]'.format(id_ticket, titulo)
        #
        msg = 'Chamado atualizado com sucesso.'
        if len(lista_emails) > 0 and enviar_email:
            try:
                HelpdeskAuxiliar.enviar_email_helpdeskV2(lista_emails, titulo_mensagem, id_ticket)
            except Exception as err:
                msg += 'Mas teve algum problema no envio do email.'

        return {
            'sucesso': msg,
            'data': ticket_registro
        }

@blp.route('/helpdesk_filtro')
class HelpdeskFiltroView(MethodView):

    @login_required
    @blp.arguments(HelpdeskFiltroSchema, location='query')
    @blp.response(200, HelpdeskTicketSchema(many=True))
    def get(self, item_data):
        ''' Aplicar filtro nos chamados que atenderem as condições informadas'''
        user: User = current_user

        SQL_PARAM = []
        for k in item_data:

            if k == 'id_ticket':
                SQL_PARAM.append( Ticket.id.in_( item_data[k].split(',') ) )
            if k == 'solicitante':
                SQL_PARAM.append( Ticket.id_usuario.in_(item_data[k].split(',') ) )
            elif k == 'assunto':
                SQL_PARAM.append(TicketAssunto.id.in_( item_data[k].split(',') ))
            elif k == 'agente':
                SQL_PARAM.append( 
                    Ticket.id_agente.in_(item_data[k].split(',') ) )
            elif k == 'status':
                SQL_PARAM.append(TicketStatus.id.in_(item_data[k].split(',') ) )
            elif k == 'atrasado':
                SQL_PARAM.append(
                    and_( TicketStatus.id.notin_(
                            [ i for i in [STATUS_RESOLVIDO, STATUS_ENCERRADO] ]
                        ), 
                        Ticket.dtprazo < datetime.now().strftime('%Y-%m-%d') 
                    )
                )

        if len(SQL_PARAM) == 0:
            return json.dumps([])

        is_agent_helpdesk = HelpdeskAuxiliar.is_agent(user.id) 

        if not is_agent_helpdesk:
            SQL_PARAM.append(
                Ticket.id_usuario.in_([ user.id ] )
            )
        
        return HelpdeskAuxiliar.get_helpdesk_list(tuple(SQL_PARAM))

@blp.route('/helpdesk_envolvidos')
class HelpdeskEnvolvidosView(MethodView):

    @login_required
    @blp.arguments(HelpdeskEnvolvidosSchema)
    @blp.response(200, HelpdeskEnvolvidosSchema)
    def put(self, item_data):
        ''' Atualiza os utilizadores envolvidos no envio ticket '''
        id_ticket, copy_helpdesk = itemgetter(
            'id_ticket', 'copia_chamado'
        )(item_data)

        user: User = current_user

        ID = user.id

        _ticket_registro = HelpdeskAuxiliar.get_helpdesk_list( 
            ( Ticket.id == id_ticket, ) 
        )

        is_agent_helpdesk = HelpdeskAuxiliar.is_agent(ID)
        
        if not is_agent_helpdesk:
            if _ticket_registro[0]['id_usuario'] != ID:
                return abort(
                    400, 
                    message='O ticket mencionado não pertence ao seu usuário não pode interagir'
                )

        HelpdeskAuxiliar.add_copy_to_helpdesk(
            id_ticket, list(set(copy_helpdesk))
        )

        return {
            'sucesso': 'Usuários em cópia atualizados com sucesso',
            'data': HelpdeskAuxiliar.get_copy_helpdesk(id_ticket)
        }




