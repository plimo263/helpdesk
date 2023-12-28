'''
Objeto modelo de dados de configuração
'''
from typing import Dict
from db.config_table import ConfigTable


class ConfigData:

    def __init__(self, id: int, name: str, value: str, description: str) -> None:
        self.id = id
        self.name = name 
        self.value = value 
        self.description = description
    

    def to_dict(self) -> Dict:
        ''' Retorna uma representação de um dicionario do objeto ConfigData.
        
        Examples:
            >>> c_data = ConfigData(id=1, name='NOVO_RECURSO', value='12', description='Recurso totalmente novo no sistema')
        
        '''
        return {
            'id': self.id,
            'name': self.name,
            'value': self.value,
            'description': self.description
        }

    @staticmethod
    def from_db(data_db: ConfigTable):
        ''' Cria um objeto ConfigData baseado nos campos de um 
        objeto configTable.
        
        Parameters:
            data_db: Uma instancia de um ORM ConfigTable para carregar um objeto ConfigData

        Examples:
            >>>> c = ConfigTable.query.get(1)
            >>>> c_data = ConfigData.from_db(c)
            
        '''

        return ConfigData(id = data_db.id, name = data_db.nome, value=data_db.valor, description=data_db.descricao)
