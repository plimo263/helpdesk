from operator import itemgetter
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required
from sqlalchemy.exc import IntegrityError
from models import User
from db import User as UserTable
from decorators.is_agent import is_agent
from schemas.manage_users.manager_users_schema import ManagerUserDelSchema, ManagerUserPostSchema, ManagerUserPutSchema, ManagerUserSchema

def user_to_dict(user: UserTable):
    return {
            "id": user.id, 
            "name": user.nome, 
            "email": user.email, 
            "is_agent": user.is_agent,
            "active": user.ativo,
            "id_sector": user.id_setor,
            "sector": {
                "id": user.sector.id,
                "name": user.sector.nome
            }
        }

blp = Blueprint('manager_user_api', __name__, description='Manutenção de usuarios do sistema')

@blp.route('/manager_user')
class ManagerUserView(MethodView):

    @login_required
    @is_agent
    @blp.response(200, ManagerUserSchema(many=True))
    def get(self):
        '''Retorna todos os setores'''

        return [ user_to_dict(user) for user in User.get_all(to_register=True) ]
    
    @login_required
    @is_agent
    @blp.arguments(ManagerUserPostSchema)
    @blp.response(200, ManagerUserPostSchema)
    def post(self, item_data):
        '''Cadastra um novo usuario no sistema'''

        name, password, email, agent, active, id_sector = itemgetter('name', 'password', 'email', 'is_agent', 'active', 'id_sector')(item_data)

        try:
            new_user: User = User.create_user(name, email, password, agent, active, id_sector)
        except IntegrityError as err:
            abort(400, message='Já existe um usuário registrado com este email')
        except Exception as err:
            abort(400, message='Erro ao tentar cadastrar o usuário.')

        new_user = [ user_to_dict(user) for user in User.get_all(to_register=True) if user.id == new_user.id ][0]

        return {
            'data': new_user,
            'sucesso': 'Usuario cadastrado com sucesso',
        }
    
    @login_required
    @is_agent
    @blp.arguments(ManagerUserPostSchema)
    @blp.response(200, ManagerUserPostSchema)
    def post(self, item_data):
        '''Cadastra um novo usuario no sistema'''

        name, password, email, agent, active, id_sector = itemgetter('name', 'password', 'email', 'is_agent', 'active', 'id_sector')(item_data)

        try:
            new_user: User = User.create_user(name, email, password, agent, active, id_sector)
        except IntegrityError as err:
            abort(400, message='Já existe um usuário registrado com este email')
        except Exception as err:
            abort(400, message='Erro ao tentar cadastrar o usuário.')

        new_user = [ user_to_dict(user) for user in User.get_all(to_register=True) if user.id == new_user.id ][0]

        return {
            'data': new_user,
            'sucesso': 'Usuario cadastrado com sucesso',
        }
    
    @login_required
    @is_agent
    @blp.arguments(ManagerUserPutSchema)
    @blp.response(200, ManagerUserPutSchema)
    def put(self, item_data):
        '''Atualiza o usuario no sistema'''

        id, name, password, email, agent, active, id_sector = itemgetter('id', 'name', 'password', 'email', 'is_agent', 'active', 'id_sector')(item_data)

        try:
            update_user: User = User.update_user(id, name, email, password, agent, active, id_sector)
        except IntegrityError as err:
            abort(400, message='Já existe um usuário registrado com este email')
        except Exception as err:
            print(err)
            abort(400, message='Erro ao tentar atualizar o usuário.')

        update_user = [ user_to_dict(user) for user in User.get_all(to_register=True) if user.id == update_user.id ][0]

        return {
            'data': update_user,
            'sucesso': 'Usuario atualizado com sucesso',
        }
    
    @login_required
    @is_agent
    @blp.arguments(ManagerUserDelSchema)
    @blp.response(200, ManagerUserDelSchema)
    def delete(self, item_data):
        '''Exclui o usuario no sistema'''

        id = itemgetter('id')(item_data)

        try:
            User.delete_user(id)
        except Exception as err:
            abort(400, message='Erro ao tentar excluir o usuário.')

        return {
            'sucesso': 'Usuario excluido com sucesso',
        }