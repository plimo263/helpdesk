from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required
from db import Ticket
from routes.helpdesk.helpdesk_gestao_auxiliar import HelpdeskGestaoAuxiliar

from schemas.helpdesk.helpdesk_gestao_schema import HelpdeskGestaoSchema


blp = Blueprint('helpdesk_gestao_api', __name__, description = 'Dados estatisticos da gestão do helpdesk')

@blp.route('/gestao_helpdesk')
class HelpdeskGestaoView(MethodView):

    @login_required
    @blp.arguments(HelpdeskGestaoSchema, location='query')
    def get(self, item_data):
        ''' Recupera dados estatisticos do Helpdesk como quantidade de tickets
        quantidade por status, assunto, etc...'''

        de, ate = item_data['de'].strftime('%Y-%m-%d 00:00:00'), item_data['ate'].strftime('%Y-%m-%d 23:59:59')


        filter_apply = [
            Ticket.dtabertura.between(de, ate)
        ]

        if 'agente' in item_data:
            filter_apply.append(Ticket.id_agente.in_( item_data['agente'].split(',') ))
        
        if 'assunto' in item_data:
            filter_apply.append(Ticket.idassunto.in_( item_data['assunto'].split(',') ))
        
        if 'status' in item_data:
            filter_apply.append(Ticket.idstatus.in_( item_data['status'].split(',') ))
        
        if 'usuario' in item_data:
            filter_apply.append(Ticket.id_usuario.in_(item_data['usuario'].split(',')))
        
        filter_apply = tuple(filter_apply)

        return {
            'total': HelpdeskGestaoAuxiliar.ticket_total(filter_apply),
            'status': HelpdeskGestaoAuxiliar.ticket_by_status(filter_apply),
            'agente': HelpdeskGestaoAuxiliar.ticket_by_agent(filter_apply),
            'assunto': HelpdeskGestaoAuxiliar.ticket_by_subject(filter_apply),
            'usuario': HelpdeskGestaoAuxiliar.ticket_by_user(filter_apply),
            'setor': HelpdeskGestaoAuxiliar.ticket_by_sector(filter_apply),
            'mes': HelpdeskGestaoAuxiliar.ticket_by_month(filter_apply),
            'tempo_medio': HelpdeskGestaoAuxiliar.ticket_by_time_medium_subject(filter_apply),
        }