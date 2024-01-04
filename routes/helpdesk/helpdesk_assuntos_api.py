from operator import itemgetter
from flask.views import MethodView
from flask_smorest import Blueprint, abort 
from sqlalchemy.exc import IntegrityError
from decorators.is_agent import is_agent
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar
from schemas.helpdesk.helpdesk_assunto_schema import HelpdeskAssuntoDelSchema, HelpdeskAssuntoPostSchema, HelpdeskAssuntoPutSchema, HelpdeskAssuntoSchema


blp = Blueprint('helpdesk_assuntos_api', __name__, description = 'Manutenção dos assuntos do Helpdesk')

@blp.route('/helpdesk_assunto')
class HeldeskAssuntoView(MethodView):

    @is_agent
    @blp.response(200, HelpdeskAssuntoSchema(many=True))
    def get(self):
        ''' Retorna os assuntos disponiveis no sistema '''
        return [ item for item in HelpdeskAuxiliar.get_subjects(with_situation=True) ]
    
    @is_agent
    @blp.arguments(HelpdeskAssuntoPostSchema)
    @blp.response(200,HelpdeskAssuntoPostSchema)
    def post(self, item_data):
        ''' Registra um novo assunto '''
        name, praz = itemgetter('nome', 'prazo')(item_data)

        try:
            return {
                'data': HelpdeskAuxiliar.add_subject(name, praz),
                'sucesso': 'Assunto criado com sucesso',
            }
        except IntegrityError:
            return abort(400, message='Ja existe um assunto com este nome')
        except Exception as err:
            return abort(400, message='Erro ao tentar criar o assunto. Tentar novamente')

    @is_agent
    @blp.arguments(HelpdeskAssuntoPutSchema)
    @blp.response(200,HelpdeskAssuntoPutSchema)
    def put(self, item_data):
        ''' Edita um assunto existente '''
        id_subject, name, praz, situation = itemgetter(
            'id_assunto', 'nome', 'prazo', 'situacao'
        )(item_data)

        try:
            return {
                'data': HelpdeskAuxiliar.update_subject(id_subject, name, praz, situation),
                'sucesso': 'O assunto foi atualizado com sucesso'
            }
        except IntegrityError as err:
            return abort(400, message='Esse nome já existe em outro assunto.')
        except Exception as err:
            return abort(400, message='Erro ao tentar atualizar o assunto.')
    
    @is_agent
    @blp.arguments(HelpdeskAssuntoDelSchema)
    @blp.response(200,HelpdeskAssuntoDelSchema)
    def delete(self, item_data):
        ''' Exclui um assunto existente '''
        id_subject = item_data['id_assunto']

        try:
            HelpdeskAuxiliar.del_subject(id_subject)
            return {
                'sucesso': 'Assunto excluido com sucesso'
            }
        except IntegrityError:
            return abort(400, message='Não foi possível excluir o assunto pois o mesmo já existe em algum helpdesk. Uma opção é marca-lo como inativo.')
        except ValueError as err:
            return abort(400, message=str(err))
        except Exception as err:
            return abort(400, message='Erro ao tentar excluir o assunto')
