from marshmallow import fields, Schema 

class SuccessSchema(Schema):
    sucesso = fields.Str(dump_only=True)