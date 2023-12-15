'''
Teste sobre a classe UserDB
'''
import sys
import unittest
from typing import List
sys.path.insert(0, '../../../')
from models.user import UserDB, User
from db import User as UserTable
from __init__ import create_app

app = create_app()
ID_NEW_USER = 0

class TestUserDB(unittest.TestCase):
    __id = 1
    __email = 'admin@helpdesk.com'

    def test_get_by_id(self):
        ''' Testa a recuperacao de um usuario '''
        with app.app_context():
            user = UserDB().get_by_id(self.__id)
            self.assertIsInstance(user, UserTable)
    
    def test_get_by_email(self):
        ''' Testa a recuperacao de um usuario por email '''
        with app.app_context():
            user = UserDB().get_by_email(self.__email)
            self.assertIsInstance(user, UserTable)
    
    def test_user_exists(self):
        '''Verifica se o usuario informado existe'''
        with app.app_context():
            is_exists = UserDB().user_exists(self.__id)
            self.assertTrue(is_exists)

    def test_get_all_rows(self):
        '''Verifica se uma lista de registros de usuário é retornado'''
        with app.app_context():
            rows = UserDB().get_all_rows()
            self.assertIsInstance(rows, list)
            self.assertGreater(len(rows), 0)

    def test_get_all_with_user(self):
        '''Verifica se uma lista de usuarios é retornado'''
        with app.app_context():
            rows = UserDB().get_all_with_user()
            self.assertIsInstance(rows, list)
            self.assertGreater(len(rows), 0)
    
    def test_a_create_user(self):
        '''Cria um novo usuario no sistema'''
        global ID_NEW_USER
        with app.app_context():
            
            user = UserDB().create_user(
                'teste', 'teste@teste.com',
                '12333323', 'N', 
                'S', 1
            )
            self.assertIsInstance(user, User)

            ID_NEW_USER = user.id
    
    def test_b_update_user(self):
        '''Atualiza um usuário já existente.'''
        global ID_NEW_USER
        with app.app_context():
            
            user = UserDB().update_user(
                ID_NEW_USER,
                'teste', 'teste@teste.com',
                '12333323', 'N', 
                'S', 1
            )
            self.assertIsInstance(user, User)
    
    def test_c_set_password(self):
        '''Atualiza a senha de um usuário.'''
        global ID_NEW_USER
        with app.app_context():
            UserDB().set_password(
                ID_NEW_USER,
                'admin'
            )
    
    def test_d_set_name(self):
        '''Atualiza o nome do usuário.'''
        global ID_NEW_USER
        with app.app_context():
            UserDB().set_name(
                ID_NEW_USER,
                'Adm'
            )
    
    def test_e_set_avatar(self):
        '''Atualiza o avatar do usuário.'''
        global ID_NEW_USER
        with app.app_context():
            UserDB().set_avatar(
                ID_NEW_USER,
                'FOTO.png'
            )
    
    def test_f_set_agent(self):
        '''Atualiza o status de agente do usuário.'''
        global ID_NEW_USER
        with app.app_context():
            UserDB().set_agent(
                ID_NEW_USER,
                False
            )
    
    def test_g_register_last_login(self):
        '''Atualiza o ultimo acesso ao sistema pelo usuário.'''
        global ID_NEW_USER
        with app.app_context():
            user = UserDB().register_last_login(
                ID_NEW_USER,
            )

    def test_z_delete_user(self):
        '''Atualiza um usuário já existente.'''
        global ID_NEW_USER
        with app.app_context():
            
            UserDB().delete_user(
                ID_NEW_USER,
                
            )
            


if __name__ == '__main__':
    unittest.main()