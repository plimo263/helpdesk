from operator import itemgetter
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required
from decorators.is_agent import is_agent
from schemas.config_helpdesk.config_helpdesk_schema import ConfigHelpdeskSchema, ConfigHelpeskDelSchema, ConfigHelpeskPostSchema, ConfigHelpeskPutSchema
from models import Config
from models.config import ConfigData


blp = Blueprint('config_helpdesk_api', __name__, description='Variaveis de configuração do sistema')

@blp.route('/config_helpdesk')
class ConfigHelpdeskView(MethodView):

    @login_required
    @is_agent
    @blp.response(200, ConfigHelpdeskSchema(many=True))
    def get(self):
        '''Retorna uma lista com todas as variaveis configuradas do sistema.'''

        c = Config()

        dicts = c.get_all()

        return [ dicts[k]  for k in dicts ]

    @login_required
    @is_agent
    @blp.arguments(ConfigHelpeskPostSchema)
    @blp.response(200, ConfigHelpeskPostSchema)
    def post(self, item_data):
        '''Incluir uma nova configuração no sistema.'''
        name, value, description = itemgetter('name', 'value', 'description')(item_data)

        config_data: ConfigData = ConfigData(id=0, name=name, value=value, description=description)

        c = Config()
        try:
            config_data = c.save(config_data)
        except Exception as err:
            abort(400, message='Erro ao tentar cadastrar uma nova variavel ao sistema')

        return {
            'sucesso': 'Nova variavel criada com sucesso',
            'data': config_data
        }
    
    @login_required
    @is_agent
    @blp.arguments(ConfigHelpeskPutSchema)
    @blp.response(200, ConfigHelpeskPutSchema)
    def put(self, item_data):
        '''Editar uma nova configuração do sistema.'''
        id, name, value, description = itemgetter('id', 'name', 'value', 'description')(item_data)

        config_data: ConfigData = ConfigData(id=id, name=name, value=value, description=description)

        c = Config()
        try:
            config_data = c.update(config_data)
        except Exception as err:
            abort(400, message='Erro ao tentar atualizar a variavel ao sistema')

        return {
            'sucesso': 'Variavel atualizada com sucesso',
            'data': config_data
        }
    
    @login_required
    @is_agent
    @blp.arguments(ConfigHelpeskDelSchema)
    @blp.response(200, ConfigHelpeskDelSchema)
    def delete(self, item_data):
        '''Editar uma nova configuração do sistema.'''
        id = itemgetter('id')(item_data)

        c = Config()
        try:
            c.delete(id)
        except Exception as err:
            abort(400, message='Erro ao tentar excluir a variavel ao sistema')

        return {
            'sucesso': 'Variavel excluida com sucesso'
        }