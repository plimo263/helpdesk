import json
from operator import itemgetter
from typing import Dict, List
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required, current_user
from db import Ticket
from models.user.user_db import UserDB
from models import User
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from routes.helpdesk.helpdesk_query import HelpdeskQueryData, HelpdeskQueryDataPage, HelpdeskQueryDataStatistics, HelpdeskQueryDataTicket
from routes.utils.bucket_route import BucketAuxiliar
from schemas.helpdesk.helpdesk_schema import HelpdeskGetSchema, HelpdeskPostSchema


CAMINHO_SALVAR_ANEXO_HELPDESK = '/dados/static/helpdesk'

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
    @blp.response(200)
    def post(self, item_data):
        ''' Registra um novo chamado no sistema do helpdesk.'''
        user: User = current_user
        
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
            if not reg.email is None and len(reg.email) > 0 and reg.id in copia_chamado
        }

        list_of_copys = [ id_usuario_copia for id_usuario_copia in copia_chamado ]

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

        lista_emails = list( lista_emails ) + list( { reg['email'] for reg in agentes if not reg['email'] is None and len(reg['email']) > 0 } )

        # Enviar email
        titulo_mensagem = 'Ticket #{} [{}]'.format( helpdesk['id'], titulo )

        msg = 'Chamado inserido com sucesso.'
        if len(lista_emails) > 0 and enviar_email:
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