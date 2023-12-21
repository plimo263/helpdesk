from extensions import db, URI_DATABASE
from sqlalchemy.dialects.mysql import MEDIUMTEXT

field_description = db.String(1000000) if URI_DATABASE.find('sqlite') != -1 else MEDIUMTEXT

class TicketInteracao(db.Model):

    idinteracao = db.Column(db.Integer ,primary_key=True ,autoincrement=True ,nullable=False )
    idticket = db.Column(db.Integer ,db.ForeignKey('ticket.id') ,nullable=False )
    dtinteracao = db.Column(db.DateTime ,nullable=True )
    descricao = db.Column(field_description ,nullable=False )
    id_usuario = db.Column(db.Integer ,nullable=True )
    de_interacao = db.Column(db.String(45) ,nullable=True )
    para_interacao = db.Column(db.String(45) ,nullable=True )
