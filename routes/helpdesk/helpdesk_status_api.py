from operator import itemgetter
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import current_user
from sqlalchemy.exc import IntegrityError
from models import User 
from decorators.is_agent import is_agent
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from schemas.helpdesk.helpdesk_status_schema import HelpdeskStatusDeleteSchema, HelpdeskStatusGetSchema, HelpdeskStatusPatchSchema, HelpdeskStatusPostSchema, HelpdeskStatusPutSchema


blp = Blueprint('helpdesk_status_api', __name__, description='Manutenção de status')


@blp.route('/helpdesk_status')
class HelpdeskStatusView(MethodView):

    @is_agent
    @blp.response(200, HelpdeskStatusGetSchema(many=True))
    def get(self):
        ''' Retorna detalhes sobre os status'''
        return HelpdeskAuxiliar.get_status_from_to()
    
    @is_agent
    @blp.arguments(HelpdeskStatusPostSchema)
    @blp.response(200, HelpdeskStatusPostSchema)
    def post(self, item_data):
        ''' Cria um novo status no sistema'''

        name, authorized_interact, color = itemgetter(
            'nome', 'autorizado_interagir', 'cor'
        )(item_data)
        
        try:
            return {
                'data': HelpdeskAuxiliar.add_status(
                    name, authorized_interact, color
                ),
                'sucesso': 'Status inserido com sucesso',
            }
        except IntegrityError:
            return abort(400, message='Já existe um status com este nome')
        except Exception as err:
            return abort(400, message='Não foi possível criar o novo status')
    
    @is_agent 
    @blp.arguments(HelpdeskStatusPutSchema)
    @blp.response(200, HelpdeskStatusPutSchema)
    def put(self, item_data):
        ''' Editar detalhes de um status existente '''
        id_status, name, authorized_interact, color, situation = itemgetter(
            'id_status', 'nome', 'autorizado_interagir', 'cor', 'situacao'
        )(item_data)

        try:
            return {
                'data': HelpdeskAuxiliar.update_status_reg(
                    id_status, name, authorized_interact, 
                    color, situation
                ),
                'sucesso': 'Status atualizado com sucesso',
            }
        except ValueError as err:
            return abort(400, message=str(err))
        except IntegrityError as err:
            return abort(400, message='O nome informado não pode ser utilizado pois ja existe')
        except Exception as err:
            return abort(400, message='Não foi possível atualizar o status')

    @is_agent 
    @blp.arguments(HelpdeskStatusPatchSchema)
    @blp.response(200, HelpdeskStatusPatchSchema)
    def patch(self, item_data):
        ''' Atualiza a lista de status para onde este status informado pode levar.'''
        id_status, status_to = itemgetter('id_status', 'status_para')(item_data)

        try:
            HelpdeskAuxiliar.update_status_to(id_status, status_to)

            return {
                'data': [ 
                    item for item in HelpdeskAuxiliar.get_status_from_to()
                    if item['id'] == id_status 
                ][0],
                'sucesso': 'Status atualizado com sucesso',
            }
        except ValueError as err:
            return abort(400, message=str(err))
        except IntegrityError as err:
            return abort(400, message='Não foi possível atualizar o status informado')
        except Exception as err:
            return abort(400, message='Não foi possível atualizar o status')
    
    @is_agent 
    @blp.arguments(HelpdeskStatusDeleteSchema)
    @blp.response(200, HelpdeskStatusDeleteSchema)
    def delete(self, item_data):
        ''' Realiza a exclusão de um status do sistmea'''
        id_status = item_data['id_status']

        try:
            HelpdeskAuxiliar.del_status(id_status)
            return {
                'sucesso': 'Status excluido com sucesso',
            }
        except ValueError as err:
            return abort(400, message=str(err))
        except IntegrityError as err:
            return abort(400, message='Não foi possível excluir o status informado. Ele pode estar sendo utilizado em algum chamado ou ter vinculos com outros status.')
        except Exception as err:
            print(err)
            return abort(400, message='Não foi possível excluir o status')
