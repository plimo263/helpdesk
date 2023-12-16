from typing import List
from datetime import datetime
from werkzeug.security import generate_password_hash
from db import User as UserTable
from extensions import db
from . import User

class UserDB:
    ''' Manipulação de usuários no banco de dados '''
    __user_table = UserTable

    def __set_attr_user(self, user_db, name: str, email: str, password: str, agent: str, active: str, id_sector: int) -> UserTable:
        '''Recebe o usuário, ativa todos os seus atributos e o retorna.
        Parameters:
            user_db: Um objeto de model da representação no banco do usuário.
            name: O nome do usuario
            email: O email do usuario
            password: A senha do usuario
            agent: Determina se ele é agente ou nao (S OU N)
            active: Determina se ele esta ativo ou nao (S OU N)
            id_sector: Determina qual o setor do usuario criado
        '''
        user_db.nome = name
        user_db.senha = generate_password_hash(password, "pbkdf2")
        user_db.email = email
        user_db.is_agent = agent
        user_db.ativo = active
        user_db.id_setor = id_sector
        return user_db
    
    def __up_insert_user(self, user_db: UserTable) -> UserTable:
        '''Salva ou atualiza o usuário no banco de dados. Este código 
        pode lançar uma Exception caso não consiga interagir corretamente 
        com o banco de dados.
        Parameters:
            user_db: Um objeto de model da representação no banco do usuário.
        '''
        try:
            db.session.add(user_db)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 
        return user_db

    def get_by_id(self, id: int) -> UserTable:
        ''' Retorna o registro que representa o usuario no db.
        Caso não exista ele lança uma Exception.
        Parameters:
            id: Identificador do usuário a ser retornado
        Examples:
            >>> u_db = UserDB()
            >>> u_db.get_by_id(1)
            User
        '''
        user: UserTable = db.session.get(self.__user_table, id)
        if not user:
            raise ValueError(f"O usuário de id {id} não existe")
        return user
    
    def get_by_email(self, email: str) -> UserTable:
        ''' Retorna o registro que representa o usuario no db.
        Caso não exista ele lança uma Exception.
        Parameters:
            email: Email do usuário a ser retornado
        Examples:
            >>> u_db = UserDB()
            >>> u_db.get_by_email('fulano@gmail.com')
            User
        '''
        user: UserTable = self.__user_table.query.filter( UserTable.email == email).first()
        if not user:
            raise ValueError(f"O usuário de email {email} não existe")
        return user

    def user_exists(self, id: int) -> bool:
        '''Verifica se o usuario existe no sistema pelo seu ID.
        Parameters:
            id: O identificador do usuário a ser validado
        Examples:
            >>> u_db = UserDB()
            >>> u_db.user_exists(1)
            True
        '''
        user = db.session.get(self.__user_table, id)

        return False if not user else True

    def get_all_rows(self) -> List[UserTable]:
        ''' Retorna uma lista de usuarios no sistema.
        Examples:
            >>> u_db = UserDB()
            >>> u_db.get_all_rows()
            [UserTable, UserTable]
        '''
        return self.__user_table.query.all()

    def get_all_with_user(self) -> List[User]:
        ''' Retorna a lista de usuarios instanciados como Users do sistema.
        Examples:
            >>> u_db = UserDB()
            >>> u_db.get_all_with_user()
            [User, User]
        '''
        return [ User(row.id) for row in self.get_all_rows() ]

    def create_user(self, name: str, email: str, password: str, agent: str, active: str, id_sector: int) -> User:
        ''' Cria um novo usuario no sistema e o retorna como User
        Parameters:
            name: O nome do usuario
            email: O email do usuario
            password: A senha do usuario
            agent: Determina se ele é agente ou nao (S OU N)
            active: Determina se ele esta ativo ou nao (S OU N)
            id_sector: Determina qual o setor do usuario criado
        Examples:
            >>> u_db = UserDB()
            >>> u_db.create_user('FULANO', 'fulano@gmail.com', '123', 'N', 'S', 1)
            User
        '''

        new_user: UserTable = UserTable()
        new_user = self.__set_attr_user(
            new_user, 
            name, email, password, 
            agent, active, id_sector
        )

        new_user = self.__up_insert_user(new_user)
        
        return User(new_user.id)

    def update_user(self, id: int, name: str, email: str, agent: str, active: str, id_sector: int) -> User:
        ''' Atualiza um usuario no sistema e o retorna.
        Parameters:
            id: O id do usuario a ser atualizado
            name: O nome do usuario
            email: O email do usuario
            agent: Determina se ele é agente ou nao (S OU N)
            active: Determina se ele esta ativo ou nao (S OU N)
            id_sector: Determina qual o setor do usuario criado
        '''
        try:
            user_update: UserTable = self.get_by_id(id)
        except Exception:
            raise ValueError('O usuario informado não existe')
        
        user_update.nome = name
        user_update.email = email
        user_update.is_agent = agent
        user_update.ativo = active
        user_update.id_setor = id_sector

        user_update = self.__up_insert_user(user_update)

        return User(user_update.id)

    def delete_user(self, id: int):
        ''' Exclui o usuario do banco de dados
        Parameters:
            id: O id do usuario a ser excluido
        '''

        delete_user: UserTable = self.get_by_id(id)
        if not delete_user:
            raise ValueError('O usuário informado não existe')

        try:
            db.session.delete(delete_user)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 

    def set_password(self, id: int, password: str):
        ''' Realiza a atualização da senha do usuario. Uma Exception 
        pode ser lançada caso o usuario nao exista ou algum erro no banco.
        Parameters:
            id: O id do usuário a ser autenticado
            password: A senha do usuario a ser atualizada
        Examples:
            >>> u_db = UserDB()
            >>> u_db.set_password(1, '1232')
        '''
        user: UserTable = self.get_by_id(id)

        user.senha = generate_password_hash(password, "pbkdf2")
        self.__up_insert_user(user)

    def set_name(self, id: int, name: str):
        '''Realiza a atualização do nome do usuário. Uma Exception 
        pode ser lançada caso o usuário não exista ou algum erro no banco.
        Parameters:
            id: O id do usuario a ter o nome alterado.
            name: Uma string que represente o nome do usuario
        Examples:
            >>> u_db = UserDB()
            >>> u_db.set_name(1, 'Fula')
        '''
        user: UserTable = self.get_by_id(id)
        
        user.nome = name
        self.__up_insert_user(user)

    def set_avatar(self, id: int, avatar: str):
        ''' Atualiza a foto do usuario. Uma exception pode 
        ser lançada caso o usuário não exista ou algum erro no banco.
        Parameters:
            id: O id do usuario a ter a foto alterada
            avatar: O nome do arquivo que representa o avatar do usuario
        Examples:
            >>> u_db = UserDB()
            >>> u_db.set_avatar(1, 'foto.png')
        '''
        user: UserTable = self.get_by_id(id)
        user.avatar = avatar 
        self.__up_insert_user(user)

    def set_agent(self, id: int, agent: bool):
        ''' Atualiza o status do usuário para agente ou não. 
        Uma exception pode ser lançada 
        caso o usuário não exista ou algum erro aconteça no banco.
        Parameters:
            id: O id do usuario a ser alterado para gerente
            agent: Um booleano que determina se o usuario será ou não agente.
        '''
        user: UserTable = self.get_by_id(id)
        user.is_agent = 'S' if agent else 'N'
        self.__up_insert_user(user)

    def register_last_login(self, id: int) -> UserTable:
        ''' Registra o ultimo acesso do usuário no sistema (data atual).
        Caso o usuário não exista uma Exception será lançada.
        Parameters:
            id: O id que identifica o usuario
        Examples:
            >>> u_db = UserDB()
            >>> u_db.regiter_last_login(1)
            UserTable
        '''
        user: UserTable = self.get_by_id(id)
        user.ultimo_login = datetime.now()
        user = self.__up_insert_user(user)

        return user