'''
Teste sobre a classe Config
'''
import sys
import unittest

sys.path.insert(0, '../../../')
from db import ConfigTable
from extensions import db
from models.config import ConfigData
from __init__ import create_app

phrase = 'Uma configuração nova para ser criada no sistema.'
name_var = 'TESTE' 

app = create_app()


class TestConfigData(unittest.TestCase):

    def test_to_dict(self):
        
        c = ConfigData(1, 'VARIAVEL', '1', 'VARIAVEL NOVA')
        self.assertEqual(c.to_dict(), {'id': 1, 'name': 'VARIAVEL', 'value': '1', 'description': 'VARIAVEL NOVA'})
    
    def test_from_db(self):
        with app.app_context():
            data_db = db.session.get(ConfigTable, 1)
            c = ConfigData.from_db(data_db)
            self.assertEqual(c.id, 1)


if __name__ == '__main__':
    unittest.main()