'''
Descrição:
  Realiza a inicialização do banco de dados no sistema criando as tabelas iniciais.
'''

from werkzeug.security import generate_password_hash

from __init__ import create_app
from extensions import db
from db import User, Sector, TicketStatus, TicketStatusDePara, TicketAssunto
from models.config.config import Config
from models.config.config_data import ConfigData

app = create_app()


def init():
    with app.app_context():
        db.create_all()
        init_sectors()
        init_configs()
        init_status()
        init_subject()
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
      ConfigData(id=0, name='DAYS_OF_WAIT_USER', value='10', description='Quantidade de dias que um chamado pode ficar no status AGUARDANDO USUÁRIO'),
   ]

   c = Config()

   for item in config_list:
      c.save(item)

def init_status():
    ''' Instancia todos os status e estrutura de fluxo padrão dos mesmos'''
    status_list = [
      { "id": 1, "descricao": "Aberto", "autorizado_interagir": "A", "situacao": "A", "cor": "#4caf50" },
      { "id": 2, "descricao": "Encerrado", "autorizado_interagir": "S",  "situacao": "A",  "cor": "#d32f2f" }, 
      { "id": 3, "descricao": "Resolvido",  "autorizado_interagir": "S",  "situacao": "A",  "cor": "#852525" }, 
      { "id": 4, "descricao": "Em atendimento",  "autorizado_interagir": "A",  "situacao": "A",  "cor": "#673ab7" }, 
      { "id": 5, "descricao": "Em desenvolvimento",  "autorizado_interagir": "A",  "situacao": "A",  "cor": "#2196f3" }, 
      { "id": 6, "descricao": "Aguardando Usuario",  "autorizado_interagir": "S",  "situacao": "A",  "cor": "#9c27b0" }, 
      { "id": 7, "descricao": "Reaberto",  "autorizado_interagir": "A",  "situacao": "A",  "cor": "#009688" }, 
      { "id": 8, "descricao": "Rejeitado",  "autorizado_interagir": "A",  "situacao": "A",  "cor": "#b71c1c" },
    ]
    
    status_from_to = [
      { "status_de": 1, "status_para": 2 },
      { "status_de": 1, "status_para": 3 },
      { "status_de": 1, "status_para": 4 },
      { "status_de": 1, "status_para": 5 },
      { "status_de": 1, "status_para": 6 },
      { "status_de": 3, "status_para": 7 },
      { "status_de": 4, "status_para": 2 },
      { "status_de": 4, "status_para": 3 },
      { "status_de": 4, "status_para": 5 },
      { "status_de": 4, "status_para": 6 },
      { "status_de": 5, "status_para": 3 },
      { "status_de": 5, "status_para": 6 },
      { "status_de": 6, "status_para": 1 },
      { "status_de": 6, "status_para": 2 },
      { "status_de": 6, "status_para": 3 },
      { "status_de": 6, "status_para": 8 },
      { "status_de": 7, "status_para": 3 },
      { "status_de": 7, "status_para": 4 },
      { "status_de": 7, "status_para": 5 },
      { "status_de": 7, "status_para": 6 },
      { "status_de": 8, "status_para": 4 },
      { "status_de": 8, "status_para": 5 },
      { "status_de": 8, "status_para": 6 },
    ]
    
    # Preenche a tabela de status
    for row in status_list:
        ticket_status = TicketStatus(
            id = row['id'],
            descricao = row['descricao'],
            autorizado_interagir = row['autorizado_interagir'],
            situacao = row['situacao'],
            cor = row['cor']
        )
        db.session.add(ticket_status)
        db.session.commit()
    
    # Linka os status de/para
    for row_st in status_from_to:
       ticket_status_from_to = TicketStatusDePara(
          status_de = row_st['status_de'],
          status_para = row_st['status_para']
       )
       db.session.add(ticket_status_from_to)
       db.session.commit()

def init_subject():
   ''' Cria os assuntos padrão para utilizacao no sistema '''
   subjects_list = [
        { "id": 1, "descricao": "Rede",  "prazo": "7",  "situacao": "A" }, 
        { "id": 2, "descricao": "Hardware",  "prazo": "7",  "situacao": "A" },
        { "id": 3, "descricao": "Outros",  "prazo": "7",  "situacao": "A" },
        { "id": 4, "descricao": "Software",  "prazo": "7",  "situacao": "A" },
        { "id": 5, "descricao": "Telefonia",  "prazo": "7",  "situacao": "A" },
   ]
   
   for row in subjects_list:
      ticket_subject = TicketAssunto(
        id = row['id'],
        descricao = row['descricao'],
        prazo = row['prazo'],
        situacao = row['situacao']
      )

      db.session.add(ticket_subject)
      db.session.commit()

def create_admin():
    ''' Cria o primeiro usuário (admin)'''
    user: User = User(
        nome = 'Admin',
        email='admin@plimo263help.com',
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