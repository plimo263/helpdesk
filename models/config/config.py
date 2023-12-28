
from typing import Dict
from .config_data import ConfigData
from .config_db import ConfigDB


class Config:

    def __init__(self) -> None:
        self.__configDB = ConfigDB()

    def save(self, config: ConfigData) -> ConfigData:
        ''' Cria uma nova configuração no sistema, caso o nome da configuração já 
        exista uma Exception (ValueError) é lançada.
        
        Parameters:
            config: Um objeto de configuração para criação de uma nova config.
        
        Examples:
            >>> c = Config()
            >>> c_data = ConfigData(name='TESTE', value='1', description='UMA DESCRICAO')
            >>> c.save(c_data)
            ConfigData(id=1, name='TESTE', value='1', description='UMA DESCRICAO')

        '''
        data_db = self.__configDB.save(config)
        config.id = data_db.id
        
        return config

    def update(self, config: ConfigData) -> ConfigData:
        ''' Atualiza uma configuração já existente, uma exception pode ser lançada 
        caso o DB não aceite algum parametro enviado.

        Parameters:
            config: Um objeto de configuração para atualização de uma config existente.
        
        Examples:
            >>> c = Config()
            >>> c_data = c.get(1)
            >>> c_data.value = '2'
            >>> c.update(c_data)
            ConfigData(id=1, name='TESTE', value='2', description='UMA DESCRICAO')

        '''
        self.__configDB.update(config)
        return config

    def delete(self, id: int):
        ''' Exclui uma configuração recebendo o seu ID de identificação, uma exception pode ser lançada 
        caso o DB não aceite algum parametro enviado.

        Parameters:
            id: Um inteiro que identifica o item a ser excluido
        
        Examples:
            >>> c = Config()
            >>> c.delete(1)

        '''
        self.__configDB.delete(id)

    def get(self, **kwargs) -> ConfigData:
        ''' Recupera uma configuração baseado em um parametro nomeado enviado. Caso 
        não seja encontrada a config uma Exception ValueError será lançada.

        Parameters:
            name: O nome da configuração
            id: O identificador da configuração.

        Examples:
            >>> c = Config()
            >>> c.get(id=1)
            ConfigData(id=1, name='TESTE', value='2', description='UMA DESCRICAO')

        '''
        data_db = self.__configDB.get(**kwargs)
        return ConfigData.from_db(data_db)

    def get_all(self) -> Dict[str, ConfigData]:
        ''' Retorna todas as configs existentes no sistema como um Dicionario de configs.

        Examples:
            >>> c = Config()
            >>> c.get_all()
            {'TESTE': ConfigData(id=1, name='TESTE', value='2', description='UMA DESCRICAO')}

        '''
        return {row.nome: ConfigData.from_db(row) for row in self.__configDB.get_all() }

    def config_exists(self, **kwargs) -> bool:
        ''' Verifica se a configuração existe baseado no parametro.

        Parameters:
            id: Consulta baseado no id
            name: Consulta baseado no nome da configuracao
        
        Examples:
            >>> c = Config()
            >>> c.config_exists(id=1)
            True

        '''
        return self.__configDB.config_exists(**kwargs)
