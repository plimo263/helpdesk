from operator import itemgetter
from typing import Dict, List
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required, current_user
from models.user.user_db import UserDB
from models import User
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from routes.helpdesk.helpdesk_query import HelpdeskQueryData, HelpdeskQueryDataStatistics

from schemas.helpdesk.helpdesk_schema import HelpdeskGetSchema


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

        return {}