from flask import Flask
from extensions import URI_DATABASE, APP_DEBUG, SECRET_KEY
from extensions import db, login_manager
from schemas.custom_schema import CustomApi
from models import User
# Rotas
from routes import login_view, bucket_view
from routes import login_api, profile_api, sector_api, manager_user_api

def create_app():
    ''' Cria o aplicativo servidor para utilização '''

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = URI_DATABASE
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['API_TITLE'] = 'Api Rest Interatividade com o Helpdesk.'
    app.config['API_VERSION'] = 'v1'
    app.config['OPENAPI_VERSION'] = '3.0.3'
    
    if APP_DEBUG: # Ativa as paginas de manual do swagger
        app.config['OPENAPI_URL_PREFIX'] = "/"
        app.config['OPENAPI_SWAGGER_UI_PATH'] = "/swagger-ui"
        app.config['OPENAPI_SWAGGER_UI_URL'] = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist/'

    db.init_app(app)
    
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        ''' Carrega o usuario logado'''
        user: User = User(user_id)
        if user.id == None:
            return None
        return user

    api = CustomApi(app)

    api.register_blueprint(login_api)
    api.register_blueprint(profile_api)
    api.register_blueprint(sector_api)
    api.register_blueprint(manager_user_api)

    app.register_blueprint(login_view)
    app.register_blueprint(bucket_view)

    app.secret_key = SECRET_KEY
    app.debug = APP_DEBUG


    return app