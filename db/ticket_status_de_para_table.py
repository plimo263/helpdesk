from extensions import db

class TicketStatusDePara(db.Model):

    status_de = db.Column(db.Integer ,db.ForeignKey('ticket_status.id'), nullable=False, primary_key = True )
    status_para = db.Column(db.Integer ,db.ForeignKey('ticket_status.id') ,nullable=False, primary_key = True )
