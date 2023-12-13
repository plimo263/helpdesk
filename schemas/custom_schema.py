from http.client import HTTPException
from zoneinfo import ZoneInfo
from datetime import datetime
from flask_smorest import Api, ErrorHandlerMixin
from marshmallow import fields, Schema

class ErrorSchema(Schema):
    timestamp = fields.DateTime(
        required=True,
        default=lambda: datetime.now(tz=ZoneInfo('UTC')).isoformat(),
        description='Timestamp of the error.'
    )
    status = fields.Integer(required=True, description='HTTP status code of the error.')
    error = fields.String(required=True, description='HTTP error message.')
    message = fields.String(required=True, description='Error message.')


class CustomApi(Api, ErrorHandlerMixin):
    ERROR_SCHEMA = ErrorSchema

    def handle_http_exception(self, error: HTTPException):
        headers = {}
        
        payload = {
            "timestamp": datetime.now(tz=ZoneInfo('UTC')).isoformat(),
            "status": error.code,
            "error": error.name,
            "message": error.description,
        }

        # Get additional info passed as kwargs when calling abort
        # data may not exist if HTTPException was raised without webargs abort
        data = getattr(error, "data", None)
        if data:
            # If we passed a custom message
            if "message" in data:
                payload["message"] = data["message"]
            # If we passed "errors"
            if "errors" in data:
                payload["message"] += data["errors"]
            # If webargs added validation errors as "messages"
            # (you should use 'errors' as it is more explicit)
            if "messages" in data and "query" in data["messages"]:
                for k in data['messages']['query']:
                    payload['message'] = data['messages']['query'][k][0]
                    break
            
            #Aqui faz uma formatação melhor da mensagem a ser retornada
            if "messages" in data and "json" in data["messages"]:
                for k in data["messages"]["json"]:
                    payload["message"] = data["messages"]["json"][k][0]
                    break
            # Quando enviado no path
            if "messages" in data and "path" in data["messages"]:
                for k in data["messages"]["path"]:
                    payload["message"] = data["messages"]["path"][k][0]
                    break
            # If we passed additional headers
            if "headers" in data:
                headers = data["headers"]

        return payload, error.code, headers