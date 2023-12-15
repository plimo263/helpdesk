'''
Teste sobre a classe User
'''
import sys
import unittest
from datetime import datetime

sys.path.insert(0, '../../../')
from models.user import User
from __init__ import create_app

app = create_app()

class TestUser(unittest.TestCase):
    __my_id_user = 1
    __my_password_false = '123'
    __my_password_correct = 'admin'

    def test_to_dict(self):
        ''' Testa para ver se é retornado os dados como dicionario do usuario'''
        with app.app_context():
            user = User(self.__my_id_user)
            to_dict = user.to_dict()
            self.assertIsInstance(to_dict, dict)
            # Veja se tem os atributos
            self.assertIn('id', to_dict)
            self.assertIn('name', to_dict)
            self.assertIn('email', to_dict)
            self.assertIn('avatar', to_dict)
            self.assertIn('agent', to_dict)
            self.assertIn('last_login', to_dict)
            self.assertIn('sector', to_dict)
            # Veja se são dos tipos esperados
            self.assertIsInstance(to_dict['id'], int)
            self.assertIsInstance(to_dict['name'], str)
            self.assertIsInstance(to_dict['email'], str)
            self.assertIsInstance(to_dict['avatar'], str)
            self.assertIsInstance(to_dict['agent'], bool)
            self.assertIsInstance(to_dict['last_login'], datetime)
            self.assertIsInstance(to_dict['sector'], str)
            # Veja se tem mais atributos do que esperado
            self.assertEqual(len(to_dict), 7)
    
    def test_is_my_password(self):
        '''Teste sobre a senha'''
        with app.app_context():
            user = User(self.__my_id_user)
            is_correct = user.is_my_password(self.__my_password_false)
            self.assertFalse(is_correct)
            # Verifica com a senha correta
            is_correct = user.is_my_password(self.__my_password_correct)
            self.assertTrue(is_correct)
    
    def test_is_agent(self):
        ''' Verifica se ele é um agente ou nao'''
        with app.app_context():
            user = User(self.__my_id_user)
            is_agent = user.is_agent()
            self.assertTrue(is_agent)




if __name__ == '__main__':
    unittest.main()