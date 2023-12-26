import sys
import unittest

sys.path.insert(0, '../../../')
from db import ConfigTable
from extensions import db
from models.config import ConfigData
from models.config.config_db import ConfigDB

from __init__ import create_app

phrase = 'Uma configuração nova para ser criada no sistema.'
name_var = 'TESTE' 

app = create_app()

ID_CONFIG = None


class TestConfigData(unittest.TestCase):

    def test_a_save(self):
        global ID_CONFIG
        with app.app_context():
            c_data = ConfigData(id=0,name='TESTE', value='1', description='UMA DESCRICAO')

            c_db = ConfigDB()
            c_data = c_db.save(c_data)

            self.assertTrue(isinstance(c_data, ConfigTable))

            ID_CONFIG = c_data.id
    
    def test_b_get(self):
        global ID_CONFIG

        with app.app_context():
            c_db = ConfigDB()
            c_data = c_db.get(id=ID_CONFIG)

            self.assertEqual(c_data.id, ID_CONFIG)

    def test_c_update(self):
        global ID_CONFIG

        with app.app_context():
            c_db = ConfigDB()
            c_data = ConfigData.from_db(c_db.get(id=ID_CONFIG))

            c_data.value = '23'

            c_data = c_db.update(c_data)

            self.assertEqual(c_data.id, ID_CONFIG)
            self.assertEqual(c_data.valor, '23')
    
    def test_d_get_all(self):

        with app.app_context():
            c_db = ConfigDB()

            all_rows = c_db.get_all()
            self.assertIsInstance(all_rows, list)
            self.assertGreater(len(all_rows), 1)
    
    def test_e_config_exists(self):
        global ID_CONFIG
        print(ID_CONFIG)

        with app.app_context():
            is_exists = ConfigDB().config_exists(id=ID_CONFIG)
            self.assertTrue(is_exists)


    def test_f_delete(self):
        global ID_CONFIG

        with app.app_context():
            c_db = ConfigDB()
            self.assertIsNone(c_db.delete(ID_CONFIG))


if __name__ == '__main__':
    unittest.main()