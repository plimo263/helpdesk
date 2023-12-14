"""
Manutenção de um setor no sistema.
"""
from typing import Dict, Any, List
from db import Sector as SectorTable
from extensions import db

class Sector:
    
    id = None 
    name = None 
    situation = None
    def __init__(self, id, name, situation) -> None:
        self.id = id
        self.name = name 
        self.situation = situation
    
    def __upsave_sector_db(self, sector: SectorTable) -> int:
        ''' Grava o setor e/ou  atualiza ele no banco de dados '''
        try:
            db.session.add(sector)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
        return sector.id

    def save(self):
        '''Salva o setor no banco de dados do sistema'''
        sector: SectorTable = SectorTable(
            nome = self.name,
            situacao = self.situation
        )

        id = self.__upsave_sector_db(sector)
        self.id = id
    
    def update(self):
        '''Atualiza o setor atual no banco de dados'''
        sector: SectorTable = SectorTable.query.get(self.id)

        sector.nome = self.name
        sector.situacao = self.situation
        self.__upsave_sector_db(sector)

    def to_dict(self) -> Dict:
        ''' Retorna uma representação do setor em forma de dicionario
        Examples:
            >>> sector = Sector.get_sector(1)
            >>> sector.to_dict()
            {
                "id": 1,
                "name": "RH",
                "situation": "A"
            }
        '''

        return {
            'id': self.id,
            'name': self.name,
            'situation': self.situation
        }
    
    @staticmethod
    def sector_exists(id: int) -> bool:
        '''Verifica se o setor existe no banco de dados '''
        sector: SectorTable = SectorTable.query.get(id)
        if not sector:
            return False 
        return True

    @staticmethod
    def get_sector(id: int) -> Any | None:
        ''' Recupera uma instancia do setor'''
        if not Sector.sector_exists(id):
            return None
        
        sector: SectorTable = SectorTable.query.get(id)
        
        return Sector(sector.id, sector.nome, sector.situacao)
    
    @staticmethod
    def delete(id: int):
        ''' Exclui o setor no sistema, caso não seja possível lança uma Exception. '''

        sector: SectorTable = SectorTable.query.get(id)
        try:
            db.session.delete(sector)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
    
    @staticmethod
    def get_all() -> List:
        ''' Retorna todos os setores cadastrados no sistema '''
        return [ Sector(row.id, row.nome, row.situacao) for row in  SectorTable.query.all() ]
