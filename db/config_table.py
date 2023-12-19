from extensions import db 

class ConfigTable(db.Model):
    __tablename__ = 'config'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), unique = True, nullable = False)
    valor = db.Column(db.String(200), nullable = False, default = '')
    descricao = db.Column(db.Text, nullable = False, default = '')