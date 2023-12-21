from extensions import db

class Ticket(db.Model):

    id = db.Column(db.Integer ,primary_key=True ,autoincrement=True ,nullable=False )
    id_usuario = db.Column(db.Integer ,nullable=True )
    dtabertura = db.Column(db.DateTime ,nullable=True )
    dtfechamento = db.Column(db.DateTime ,nullable=True )
    dtprazo = db.Column(db.Date ,nullable=True )
    titulo = db.Column(db.String(200) ,nullable=True )
    idstatus = db.Column(db.Integer ,db.ForeignKey('ticket_status.id') ,nullable=True )
    idassunto = db.Column(db.Integer ,db.ForeignKey('ticket_assunto.id') ,nullable=True )
    id_agente = db.Column(db.Integer ,nullable=True )
