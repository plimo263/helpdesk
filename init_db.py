'''
Descrição:
  Realiza a inicialização do banco de dados no sistema criando as tabelas iniciais.
'''

from werkzeug.security import generate_password_hash, check_password_hash

from __init__ import create_app
from extensions import db
from models import User

app = create_app()


def init():
    with app.app_context():
        db.create_all()
        create_admin()


def create_admin():
    ''' Cria o primeiro usuário (admin)'''
    user: User = User(
        nome = 'Admin',
        email='admin@helpdesk.com',
        senha = generate_password_hash('admin', 'pbkdf2'),
        is_agent = 'S',
        ativo = 'S'
    )

    try:
      db.session.add(user)
      db.session.commit()
    except:
       db.session.rollback()

if __name__ == '__main__':
    init()