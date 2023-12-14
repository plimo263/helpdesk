"""
Classe que é utilizada para controlar um usuário no sistema.
"""
import os
from typing import Any, Dict
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin, login_user, logout_user
from db import User as UserTable
from extensions import db, AVATAR_PATH

class User(UserMixin):

    id = None
    name = None
    email = None
    avatar = None
    agent = None
    last_login = None

    def __init__(self, id) -> None:
        user: UserTable = UserTable.query.get(id)
        if user:
            self.__init_user(user)

    def __init_user(self, user: UserTable):
        ''' Instancia um usuario'''
        self.id = user.id
        self.name = user.nome
        self.email = user.email
        self.avatar = user.avatar
        self.agent = True if user.is_agent == 'S' else False
        self.last_login = user.ultimo_login
    
    def __save_user_db(self, user: UserTable):
        ''' Grava o usuário atualizado no banco de dados '''
        try:
            db.session.add(user)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err

    def logout(self):
        ''' Realiza o logout do usuario'''
        logout_user()
    
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
                "name": "Admin"
            }
        '''

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": os.path.join(AVATAR_PATH, self.avatar) if self.avatar else '',
            "agent": self.agent,
            "last_login": self.last_login
        }
    
    def set_password(self, password: str):
        ''' Realiza a atualização da senha do usuario'''
        user: UserTable = UserTable.query.get(self.id)
        user.senha = generate_password_hash(password, "pbkdf2")
        self.__save_user_db(user)

    def set_name(self, name: str):
        ''' Realiza a atualização do nome do usuário'''
        user: UserTable = UserTable.query.get(self.id)
        user.nome = name
        self.__save_user_db(user)

    def set_avatar(self, avatar: str):
        ''' Atualiza a foto do usuario'''
        user: UserTable = UserTable.query.get(self.id)
        user.avatar = avatar 
        self.__save_user_db(user)
    
    def set_agent(self, agent: bool):
        ''' Atualiza a foto do usuario'''
        user: UserTable = UserTable.query.get(self.id)
        user.is_agent = 'S' if agent else 'N'
        self.__save_user_db(user)

    def is_password_valid(self, password: str) -> bool:
        ''' Verifica se o password é valido'''
        user: UserTable = UserTable.query.get(self.id)
        if check_password_hash(user.senha, password):
            return True 
        return False

    def is_agent(self):
        ''' Verifica se o usuario é um agente ou nao'''
        return self.agent
    
    @staticmethod
    def login(email: str, password: str) -> Any | None:
        '''Valida se o usuário é autenticado, retornando uma instancia 
        de User ou None.
        Parameters:
            email: O email para login do usuário
            password: A senha para login do usuário
        Examples:
            >>> user = User.login('fulano@gmail.com', '123')
        '''

        user: UserTable = UserTable.query.filter( UserTable.email == email ).first()
        if not user or not check_password_hash(user.senha, password):
            return None
        
        user.ultimo_login = datetime.now()

        try:
            db.session.add(user)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
        
        user = User(user.id)
        # Agora registra o login
        login_user(user)

        return user
    
