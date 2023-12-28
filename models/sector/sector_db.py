from typing import List
from db import Sector as SectorTable
from extensions import db
from . import Sector

class SectorDB:
    ''' Classe para lidar com atividades relacionadas ao setor.'''

    def __upsave_sector_db(self, sector: SectorTable) -> int:
        ''' Grava o setor e/ou  atualiza ele no banco de dados. Lança uma Exception 
        caso não consiga realizar a gravação.
        
        Parameters:
            sector: Uma instancia do ORM SectorTable para cadastro/atualização do setor
        
        Examples:
            >>> s_reg = SectorTable.query.get(1)
            >>> s_reg.nome = 'Recursos Humanos'
            >>> s = SectorDB()
            >>> s.__upsave_sector_db(s_reg)
            1
        '''
        try:
            db.session.add(sector)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
        return sector.id

    def save(self, sector: Sector) -> int:
        '''Salva o setor no banco de dados do sistema e retorna o seu id.
    
        Parameters:
            sector: Uma instancia de um Sector

        Examples:
            >>> sector = Sector('TI','A')
            >>> s_db = SectorDB().save(sector)
            1

        '''

        sector_row: SectorTable = SectorTable(
            nome = sector.name,
            situacao = sector.situation
        )
        id = self.__upsave_sector_db(sector_row)
        self.id = id
        return id
    
    def update(self, sector: Sector):
        '''Atualiza o setor atual no banco de dados.

        Parameters:
            sector: Uma instancia do sector

        Examples:
            >>> sector = Sector(1, 'TI', 'B')
            >>> s_db = SectorDB().update(sector)

        '''
        sector_row: SectorTable = db.session.get(SectorTable, sector.id)

        sector_row.nome = sector.name
        sector_row.situacao = sector.situation
        self.__upsave_sector_db(sector_row)
    
    def sector_exists(self, id: int) -> bool:
        '''Verifica se o setor existe no banco de dados 

        Parameters:
            id: O identificador do setor no banco de dados

        Examples:
            >>> SectorDB().sector_exists(1)
            True
        '''
        sector: SectorTable = db.session.get(SectorTable, id)
        if not sector:
            return False 
        return True

    def get_by_id(self, id: int) -> SectorTable:
        ''' Retorna o registro que representa o setor no bd.

        Parameters:
            id: O identificador do setor no banco

        Examples:
            >>> SectorDB().get_by_id(1)
            SectorTable
        '''
        if not self.sector_exists(id):
            raise ValueError(f"O setor de id {id} não existe no sistema")
        
        sector: SectorTable = db.session.get(SectorTable, id)
        return sector
    
    def delete(self, id: int):
        ''' Exclui o setor no sistema, caso não seja possível lança uma Exception. 

        Parameters:
            id: O identificador do setor

        Examples:
            >>> SectorDB().delete(1)
        '''
        sector: SectorTable = self.get_by_id(id)
        try:
            db.session.delete(sector)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
    
    def get_all_rows(self) -> List[SectorTable]:
        '''Retorna a lista ORM com todos os registros dos setores cadastrados no sistema

        Examples:
            >>> SectorDB().get_all_rows()
            [SectorTable, SectorTable ]
        '''
        return [ row for row in  SectorTable.query.all() ]
    
    def get_all_with_sector(self) -> List[Sector]:
        '''Retorna a lista de Sector, com todos os setores do sistema já instanciados como Sector

        Examples:
            >>> SectorDB().get_all_with_sector()
            [Sector, Sector ]
        '''
        return [ Sector(row.id, row.nome, row.situacao) for row in  self.get_all_rows() ]