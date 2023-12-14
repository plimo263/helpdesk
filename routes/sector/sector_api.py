from operator import itemgetter
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError
from schemas.sector.sector_schema import SectorDelSchema, SectorPostSchema, SectorPutSchema, SectorResultSchema
from models import Sector
from decorators.is_agent import is_agent

blp = Blueprint('sector_api', __name__, description='Manutenção de setores do sistema')

@blp.route('/sector')
class SectorView(MethodView):

    @login_required
    @is_agent
    @blp.response(200, SectorResultSchema(many=True))
    def get(self):
        '''Retorna todos os setores'''

        return [ sector.to_dict() for sector in Sector.get_all() ]
    
    @login_required
    @is_agent
    @blp.arguments(SectorPostSchema)
    @blp.response(200, SectorPostSchema)
    def post(self, item_data):
        ''' Cadastra um novo setor'''
        name, situation = itemgetter('name', 'situation')(item_data)
        sector: Sector = Sector(0, name, situation)
        try:
            sector.save()
        except IntegrityError:
            abort(400, message='O setor já existe no sistema.')
        except Exception as err:
            abort(400, message='Erro ao tentar cadastrar um novo setor')

        return {
            'data': sector.to_dict(),
            'sucesso': 'Setor cadastrado com sucesso'
        }
    
    @login_required
    @is_agent
    @blp.arguments(SectorPutSchema)
    @blp.response(200, SectorPutSchema)
    def put(self, item_data):
        ''' Atualiza um setor cadastrado'''
        id_sector, name, situation = itemgetter('id', 'name', 'situation')(item_data)
        sector: Sector = Sector(id_sector, name, situation)
        try:
            sector.update()
        except IntegrityError:
            abort(400, message='O setor já existe no sistema.')
        except Exception as err:
            abort(400, message='Erro ao tentar atualizar o setor')

        return {
            'data': sector.to_dict(),
            'sucesso': 'Setor atualizado com sucesso.'
        }
    
    @login_required
    @is_agent
    @blp.arguments(SectorDelSchema)
    @blp.response(200, SectorDelSchema)
    def delete(self, item_data):
        ''' Exclui um setor cadastrado'''
        id_sector = itemgetter('id')(item_data)
        
        try:
            Sector.delete(id_sector)
        except IntegrityError as err:
            abort(400, message='Não é possível excluir o setor pois já foi utilizado em algum usuário')
        except Exception as err:
            abort(400, message='Erro ao tentar excluir o setor')

        return {
            'sucesso': 'Setor excluido com sucesso.'
        }
