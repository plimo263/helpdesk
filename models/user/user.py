"""
Tem controle de usuário no sistema, manipulação do usuário no banco e 
autenticação do usuário na aplicação.
"""
import os
from typing import Dict
from werkzeug.security import check_password_hash
from flask_login import UserMixin
from db import User as UserTable
from extensions import db, AVATAR_PATH

class User(UserMixin):
    ''' Usuário autenticado e o atual usuário logado no sistema.'''

    id = None
    name = None
    email = None
    avatar = None
    agent = None
    last_login = None
    sector_name = None

    def __init__(self, id) -> None:
        user: UserTable = db.session.get(UserTable, id)
        if not user:
            raise ValueError('Usuário não existe')

        self.__init_user(user)

    def __init_user(self, user: UserTable):
        ''' Instancia um usuario no sistema.
        
        Parameters:
            user: O registro do banco de dados de um usuário.
        
        '''
        self.id = user.id
        self.name = user.nome
        self.email = user.email
        self.avatar = user.avatar
        self.agent = True if user.is_agent == 'S' else False
        self.last_login = user.ultimo_login
        self.sector_name = user.sector.nome

    def to_dict(self) -> Dict:
        ''' Retorna uma representação em forma de dicionario do usuário 

        Examples:
            >>> user = User(1)
            >>> user.to_dict()
            {
                "agent": true,
                "avatar": null,
                "email": "admin@helpdesk.com",
                "id": "1",
                "last_login": "2023-12-13 20:56:29",
                "name": "Admin",
                "sector": "TI"
            }
        '''

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": os.path.join(AVATAR_PATH, self.avatar) if self.avatar else '',
            "agent": self.agent,
            "last_login": self.last_login,
            "sector": self.sector_name,
        }

    def is_my_password(self, password: str) -> bool:
        ''' Verifica se o password enviado é realmente do usuário.

        Parameters:
            password: Uma string que representa a senha do usuário

        Examples:
            >>> u = User(1)
            >>> u.is_my_password('123')
            False

        '''
        #user: UserTable = UserDB().get_by_id(self.id)
        user: UserTable = db.session.get(UserTable, self.id)
        if not user:
            raise ValueError('Usuário não existe')
        
        if check_password_hash(user.senha, password):
            return True 
        return False

    def is_agent(self):
        ''' Verifica se o usuario é um agente ou nao.

        Examples:
            >>> u = User(1)
            >>> u.is_agent()
            True
        '''
        return self.agent
