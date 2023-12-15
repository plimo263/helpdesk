'''
Teste sobre a classe SectorDB
'''
import sys
import unittest

sys.path.insert(0, '../../../')
from models.sector import SectorDB, Sector
from db import Sector as SectorTable
from __init__ import create_app

app = create_app()
ID_NEW_SECTOR = 0

class TestSectorDB(unittest.TestCase):
    
    def test_a_save(self):
        ''' Testa a criacao de um novo sector'''
        global ID_NEW_SECTOR
        with app.app_context():

            id_sector = SectorDB().save(Sector(0, 'RHAA', 'A'))
            self.assertGreater(id_sector, 0)
            ID_NEW_SECTOR = id_sector
    
    def test_b_update(self):
        ''' Testa a atualização de um sector'''
        global ID_NEW_SECTOR
        with app.app_context():
            SectorDB().update(Sector(ID_NEW_SECTOR, 'RHAB', 'A'))
    
    def test_c_sector_exists(self):
        ''' Verifica se um sector existe'''
        global ID_NEW_SECTOR
        with app.app_context():
            is_exists = SectorDB().sector_exists(ID_NEW_SECTOR)
            self.assertTrue(is_exists)

    def test_d_get_by_id(self):
        '''Obtem um sector pelo id '''
        global ID_NEW_SECTOR
        with app.app_context():
            sector = SectorDB().get_by_id(ID_NEW_SECTOR)
        
    def test_e_delete(self):
        '''Exclui o setor'''
        global ID_NEW_SECTOR
        with app.app_context():
            SectorDB().delete(ID_NEW_SECTOR)

    def test_f_get_all_rows(self):
        '''Recupera a lista dos setores'''
        with app.app_context():
            sector_list = SectorDB().get_all_rows()
            self.assertIsInstance(sector_list, list)
            self.assertGreater(len(sector_list), 0)
    
    def test_g_get_all_with_sector(self):
        '''Recupera a lista de setores como instancias se Sector'''
        with app.app_context():
            sector_list = SectorDB().get_all_with_sector()
            self.assertIsInstance(sector_list, list)
            self.assertGreater(len(sector_list), 0)


if __name__ == '__main__':
    unittest.main()