'''
Descrição:
  Realiza a inicialização do banco de dados no sistema criando as tabelas iniciais.
'''

from werkzeug.security import generate_password_hash, check_password_hash

from __init__ import create_app
from extensions import db
from db import User, Sector
from models.config.config import Config
from models.config.config_data import ConfigData

app = create_app()


def init():
    with app.app_context():
        db.create_all()
        init_sectors()
        init_configs()
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

def init_configs():
   ''' Cria as variaveis default do sistema '''
   config_list = [
      ConfigData(id=0, name='SMTP', value='', description='Servidor SMTP para envio dos e-mails'),
      ConfigData(id=0, name='SMTP_PORT', value='', description='Porta do servidor SMTP para envio dos e-mails'),
      ConfigData(id=0, name='LOGIN_EMAIL', value='', description='Endereço de e-mail usado para autenticação e envio dos emails'),
      ConfigData(id=0, name='LOGIN_PASSWD', value='', description='Senha do e-mail que vai autenticar e realizar o envio dos e-mails'),
      ConfigData(id=0, name='DAYS_OF_WAIT_USER', value='10', description='Quantidade de dias que um chamado pode ficar no status AGUARDANDO USUÁRIO'),
   ]

   c = Config()

   for item in config_list:
      c.save(item)


def create_admin():
    ''' Cria o primeiro usuário (admin)'''
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