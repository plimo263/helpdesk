from typing import List
from .config_data import ConfigData
from db import ConfigTable
from extensions import db

class ConfigDB:
    '''
    Classe para lidar com operações baseadas no banco de dados.
    '''

    def __up_insert_db(self, data_db: ConfigTable) -> ConfigTable:
        '''Atualiza/Insere registros no banco de dados
        
        Parameters:
            data_db: Uma instancia de um ORM ConfigTable que deve ser adicionado/atualizado no banco de dados.

        '''
        try:
            db.session.add(data_db)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
        return data_db

    def save(self, config: ConfigData) -> ConfigTable:
        ''' Salva a config no banco de dados, caso o nome exista ou algum erro 
        no banco uma Exception é lançada.
        
        Parameters:
            config: Um objeto de configuração para criação de uma nova config.
        
        Examples:
            >>> c = ConfigDB()
            >>> c_data = ConfigData(name='TESTE', value='1', description='UMA DESCRICAO')
            >>> c.save(c_data)
            ConfigTable
        '''
        if self.config_exists(name=config.name):
            raise Exception(f"A config {config.name} já existe")
        
        data_db: ConfigTable = ConfigTable(
            nome = config.name,
            valor = config.value,
            descricao = config.description
        )

        data_db = self.__up_insert_db(data_db)

        return data_db

    def update(self, config: ConfigData) -> ConfigTable:
        ''' Atualiza uma configuração já existente, uma exception pode ser lançada 
        caso o DB não aceite algum parametro enviado.

        Parameters:
            config: Um objeto de configuração para atualização de uma config existente.
        
        Examples:
            >>> c = ConfigDB()
            >>> c_data = c.get(1)
            >>> c_data.value = '2'
            >>> c.update(c_data)
            ConfigTable
        '''
        if not self.config_exists(id=config.id):
            raise Exception(f"A config de id {config.id} não existe")
        
        data_db: ConfigTable = db.session.get(ConfigTable, config.id)
        data_db.nome = config.name
        data_db.descricao = config.description
        data_db.valor = config.value

        data_db = self.__up_insert_db(data_db)

        return data_db

    def delete(self, id: int):
        ''' Exclui uma configuração recebendo o seu ID de identificação, 
        uma exception pode ser lançada caso o DB não aceite algum parametro enviado.

        Parameters:
            id: Um inteiro que identifica o item a ser excluido
        
        Examples:
            >>> c = ConfigDB()
            >>> c.delete(1)
        '''
        if not self.config_exists(id=id):
            return None
        
        data_db = db.session.get(ConfigTable, id)

        try:
            db.session.delete(data_db)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 

    def get(self, **kwargs) -> ConfigTable:
        ''' Recupera um registro de configuração baseado em um parametro nomeado enviado. Caso 
        não seja encontrada a config uma Exception ValueError será lançada.

        Parameters:
            name: O nome da configuração
            id: O identificador da configuração.

        Examples:
            >>> c = ConfigDB()
            >>> c.get(id=1)
            ConfigTable
        '''
        data_db: ConfigTable = None

        if 'id' in kwargs:
            data_db = db.session.get(ConfigTable, kwargs['id'])
        elif 'name' in kwargs:
            data_db = ConfigTable.query.filter(ConfigTable.nome == kwargs['name']).first()
        
        if not data_db:
            raise ValueError("A configuração não foi encontrada no sistema.")
        
        return data_db

    def get_all(self) -> List[ConfigTable]:
        ''' Retorna todos os registros existentes no sistema do configTable.

        Examples:
            >>> c = ConfigDB()
            >>> c.get_all()
            [ConfigTable, ConfigTable]
        
        '''
        return [ row for row in ConfigTable.query.all() ]

    def config_exists(self, **kwargs) -> bool:
        ''' Verifica se a configuração existe baseado no parametro.

        Parameters:
            id: Consulta baseado no id
            name: Consulta baseado no nome da configuração
        '''
        if 'id' in kwargs:
            try:
                self.get(id=kwargs['id'])
            except Exception:
                return False
        elif 'name' in kwargs:
            try:
                self.get(name=kwargs['name'])
            except Exception:
                return False
        
        return True