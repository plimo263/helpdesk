'''
Teste sobre a classe Config
'''
import sys
import unittest

sys.path.insert(0, '../../../')
from models.config import Config, ConfigData
from __init__ import create_app

phrase = 'Uma configuração nova para ser criada no sistema.'
name_var = 'TESTE' 

app = create_app()

class TestConfig(unittest.TestCase):

    def test_a_save_config(self):
        ''' Realiza o teste de inserção de uma configuração no sistema.'''
        global name_var, phrase
        with app.app_context():
            c = Config()
            c_data = ConfigData(id=0, name=name_var, value='2', description=phrase)
            c.save(c_data)
            self.assertIn(name_var, c.get_all())
    
    def test_b_config_exists(self):
        ''' Verifica se uma configuração existe no sistema'''
        global name_var
        with app.app_context():
            c = Config()
            is_exists = c.config_exists(name=name_var)
            self.assertTrue(is_exists)
    
    def test_c_update_config(self):
        '''Teste para atualizar alguma configuração criada'''
        global name_var, phrase
        with app.app_context():
            c = Config()
            config_data = c.get(name=name_var)
            config_data.value = '1'
            c.update(config_data)
            
            self.assertIn(name_var, c.get_all())
            
            c_test = c.get(name=name_var)

            self.assertEqual(c_test.value, '1')
            self.assertEqual(c_test.description, phrase)

    def test_d_get(self):
        '''Testa a recuperacao de um config'''
        global name_var, phrase
        with app.app_context():
            c = Config()
            config_data = c.get(name=name_var)

            self.assertIsInstance(config_data, ConfigData)

    def test_e_get_all(self):
        '''Teste para recuperar todos os configs do sistema'''
        
        with app.app_context():
            c = Config()
            config_list= c.get_all()
            self.assertGreater(len(config_list), 0)

    def test_f_config_exists(self):
        '''Teste para verificar se as configurações existem no sistema.'''
        global name_var
        with app.app_context():
            c = Config()
            is_exists = c.config_exists(name=name_var)
            self.assertTrue(is_exists)

    def test_f_delete_config(self):
        ''' Teste para excluir uma configuração criada'''
        global name_var, phrase

        with app.app_context():
            c = Config()
            c_test = c.get(name=name_var)

            c.delete(c_test.id)
            self.assertNotIn(name_var, c.get_all())

if __name__ == '__main__':
    unittest.main()


