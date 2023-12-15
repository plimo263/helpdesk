'''
Teste sobre a classe UserAuth
'''
import sys
import unittest

sys.path.insert(0, '../../../')
from models.user import UserAuth, User
from __init__ import create_app

app = create_app()

class TestUserAuth(unittest.TestCase):
    
    __email = 'admin@helpdesk.com'
    __password = 'admin'

    def test_login(self):
        ''' Testa o metodo de login'''
        pass
    
    def test_logout(self):
        '''Testa o metodo de logout'''
        pass


if __name__ == '__main__':
    unittest.main()