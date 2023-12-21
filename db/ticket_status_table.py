from extensions import db

class TicketStatus(db.Model):

    id = db.Column(db.Integer ,primary_key=True ,autoincrement=True ,nullable=False )
    descricao = db.Column(db.String(100) ,unique=True ,nullable=False )
    autorizado_interagir = db.Column(db.String(1) ,default='A' ,nullable=True )
    situacao = db.Column(db.String(1) ,nullable=True )
    cor = db.Column(db.String(7) ,default='#cccccc' ,nullable=True )
