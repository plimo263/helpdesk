from extensions import db

class TicketCopia(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    idticket = db.Column(db.Integer ,db.ForeignKey('ticket.id'), nullable=False )
    id_usuario = db.Column(db.Integer, nullable=True )
