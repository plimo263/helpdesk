from werkzeug.security import check_password_hash
from flask_login import login_user, logout_user
from db import User as UserTable
from .user import User
from .user_db import UserDB

class UserAuth:
    ''' Classe usada para autenticar usuários e manter usuarios'''

    def login(self, email: str, password: str) -> User | None:
        '''Valida se o usuário é autenticado, retornando uma instancia 
        de User ou None, caso ele não esteja ativo.

        Parameters:
            email: O email para login do usuário a plataforma.
            password: A senha para login do usuário a plataforma.

        Examples:
            >>> UserAuth().login('fulano@gmail.com', '123')
            User
        '''
        try:
            user: UserTable = UserDB().get_by_email(email)
            if not check_password_hash(user.senha, password):
                return None
            user = UserDB().register_last_login(user.id)
            user: User = User(user.id)
        except Exception as err:
            print(err)
            return None

        login_user(user)
        return user

    def logout(self):
        ''' Realiza o logout do usuario, limpando sua autenticação
        do servidor.
        
        Examples:
            >>> UserAuth().logout()
        '''
        logout_user()