from extensions import db

class TicketAssunto(db.Model):

    id = db.Column(db.Integer ,primary_key=True ,autoincrement=True ,nullable=False )
    descricao = db.Column(db.String(45) ,unique=True ,nullable=False )
    prazo = db.Column(db.Integer ,nullable=True )
    situacao = db.Column(db.String(1) ,nullable=True )
