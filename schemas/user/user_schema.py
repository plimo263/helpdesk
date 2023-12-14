from marshmallow import fields, Schema 


class UserSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)
    email = fields.Email(dump_only=True)
    avatar = fields.Str(dump_only=True)
    agent = fields.Bool(dump_only=True)
    last_login = fields.Str(dump_only=True)