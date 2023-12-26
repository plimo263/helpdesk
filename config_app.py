from extensions import URI_DATABASE, SECRET_KEY, APP_DEBUG


class Config:
    SQLALCHEMY_DATABASE_URI = URI_DATABASE
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    API_TITLE = 'Api Rest Interatividade com o Helpdesk.'
    API_VERSION = 'v1'
    OPENAPI_VERSION = '3.0.3'
    SECRET_KEY = SECRET_KEY
    DEBUG = APP_DEBUG

class ConfigDebug(Config):
    OPENAPI_URL_PREFIX = "/"
    OPENAPI_SWAGGER_UI_PATH = "/swagger-ui"
    OPENAPI_SWAGGER_UI_URL = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist/'