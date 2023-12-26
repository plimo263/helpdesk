from flask.views import MethodView
from flask_smorest import abort, Blueprint


blp = Blueprint('helpdesk_api', __name__, description = 'Interatividade com o helpdesk funcções principais')



@blp.route('/helpdesk')
class HelpdeskView(MethodView):
    

    def get(self):
        ''' Retorna dados relacionados ao Helpdesk'''