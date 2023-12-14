"""
Classe que é utilizada para controlar um usuário no sistema.
"""
import os
from typing import Any, Dict, List
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
    sector_name = None

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
        self.sector_name = user.sector.nome
    
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
    
    @staticmethod
    def user_exists(id: int) -> bool:
        '''Verifica se o usuario existe no sistema pelo seu ID'''
        user: UserTable = UserTable.query.get(id)
        if not user:
            return False 
        return True
    
    @staticmethod
    def get_all(to_register = False) -> List:
        ''' Retorna uma lista de usuarios no sistema.'''

        rows = UserTable.query.all()

        if to_register:
            return rows

        return [ User(row.id) for row in UserTable.query.all() ]
    
    @staticmethod
    def create_user(name: str, email: str, password: str, agent: str, active: str, id_sector: int):
        ''' Cria um novo usuario no sistema e o retorna.
        Parameters:
            name: O nome do usuario
            email: O email do usuario
            password: A senha do usuario
            agent: Determina se ele é agente ou nao (S OU N)
            active: Determina se ele esta ativo ou nao (S OU N)
            id_sector: Determina qual o setor do usuario criado
        '''

        new_user: UserTable = UserTable(
            nome = name,
            senha = generate_password_hash(password, "pbkdf2"),
            email = email,
            is_agent = agent,
            ativo = active,
            id_setor = id_sector
        )

        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 
        
        return User(new_user.id)

    @staticmethod
    def update_user(id: int, name: str, email: str, password: str, agent: str, active: str, id_sector: int):
        ''' Atualiza um usuario no sistema e o retorna.
        Parameters:
            id: O id do usuario a ser atualizado
            name: O nome do usuario
            email: O email do usuario
            password: A senha do usuario
            agent: Determina se ele é agente ou nao (S OU N)
            active: Determina se ele esta ativo ou nao (S OU N)
            id_sector: Determina qual o setor do usuario criado
        '''

        user_update: UserTable = UserTable.query.get(id)
        if not user_update:
            raise ValueError('O usuario informado não existe')

        user_update.nome = name
        user_update.senha = generate_password_hash(password, "pbkdf2")
        user_update.email = email
        user_update.is_agent = agent
        user_update.ativo = active
        user_update.id_setor = id_sector

        try:
            db.session.add(user_update)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 

        return User(user_update.id)
    
    @staticmethod
    def delete_user(id: int):
        ''' Exclui o usuario do banco de dados
        Parameters:
            id: O id do usuario a ser excluido
        '''

        delete_user: UserTable = UserTable.query.get(id)
        if not delete_user:
            raise ValueError('O usuario informado não existe')

        try:
            db.session.delete(delete_user)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 

