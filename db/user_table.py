"""
Classe usada para representar uma tabela que registra usuários.

"""
from extensions import db
from sqlalchemy import func

class User(db.Model):

    id = db.Column(db.Integer ,primary_key=True, autoincrement=True, nullable=False )
    nome = db.Column(db.String(100), nullable=False )
    senha = db.Column(db.String(100), nullable=False )
    email = db.Column(db.String(255), nullable=True )
    avatar = db.Column(db.String(255), nullable=True )
    is_agent = db.Column(db.String(1), default='N' ,nullable=False )
    ativo = db.Column(db.String(1) ,default='S' ,nullable=True )
    ultimo_login = db.Column(db.DateTime, default = func.now())
