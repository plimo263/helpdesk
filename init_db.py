'''
Descrição:
  Realiza a inicialização do banco de dados no sistema criando as tabelas iniciais.
'''

from werkzeug.security import generate_password_hash, check_password_hash

from __init__ import create_app
from extensions import db
from db import User, Sector

app = create_app()


def init():
    with app.app_context():
        db.create_all()
        create_admin()

def init_sectors():
    ''' Cadastra todos os setores default'''
    sectors = [
        Sector(
            id = 1,
            nome = 'TI',
            situacao = 'A'
        )
    ]

    try:
      db.session.add_all(sectors)
      db.session.commit()
    except:
       db.session.rollback()

def create_admin():
    ''' Cria o primeiro usuário (admin)'''
    init_sectors()

    user: User = User(
        nome = 'Admin',
        email='admin@helpdesk.com',
        senha = generate_password_hash('admin', 'pbkdf2'),
        is_agent = 'S',
        ativo = 'S',
        id_setor = 1
    )

    try:
      db.session.add(user)
      db.session.commit()
    except:
       db.session.rollback()

if __name__ == '__main__':
    init()