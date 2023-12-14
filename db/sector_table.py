from extensions import db 

class Sector(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement=True, nullable = False)
    nome = db.Column(db.String(100), unique = True, nullable = False)
    situacao = db.Column(db.String(1), default = 'A', nullable = False) # A - Ativo, B - Desativado
    user = db.relationship("User", back_populates="sector")
