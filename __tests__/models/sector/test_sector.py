'''
Teste sobre a classe Sector
'''
import sys
import unittest

sys.path.insert(0, '../../../')
from models.sector import Sector
from db import Sector as SectorTable
from __init__ import create_app

app = create_app()
ID_NEW_USER = 0

class TestSector(unittest.TestCase):

    def test_to_dict(self):
        ''' Recupera a estrutura em dicionario de um setor inicializado '''
        s = Sector(0, 'RH', 'A')
        to_dict = s.to_dict()
        self.assertIsInstance(to_dict, dict)
        # Veja as keys
        self.assertIn('id', to_dict)
        self.assertIn('name', to_dict)
        self.assertIn('situation', to_dict)
        # Veja os valores se são instancias
        self.assertIsInstance(to_dict['id'], int)
        self.assertIsInstance(to_dict['name'], str)
        self.assertIsInstance(to_dict['situation'], str)
        # Veja se tem somente 3 propriedades
        self.assertEqual(len(to_dict), 3)

if __name__ == '__main__':
    unittest.main()