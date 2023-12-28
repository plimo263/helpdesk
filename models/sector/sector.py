"""
Manutenção de um setor no sistema.
"""
from typing import Dict

class Sector:
    
    id = None 
    name = None 
    situation = None
    def __init__(self, id: int, name: str, situation: str) -> None:
        self.id = id
        self.name = name 
        self.situation = situation

    def to_dict(self) -> Dict:
        ''' Retorna uma representação do setor em forma de dicionario.

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
