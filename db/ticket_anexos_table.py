from extensions import db

class TicketAnexos(db.Model):

    id = db.Column(db.Integer ,primary_key=True ,autoincrement=True ,nullable=False )
    idticket = db.Column(db.Integer ,db.ForeignKey('ticket.id') ,nullable=True )
    idinteracao = db.Column(db.Integer ,db.ForeignKey('ticket_interacao.idinteracao') ,nullable=True )
    descricao = db.Column(db.String(100) ,nullable=True )
