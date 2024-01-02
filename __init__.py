from http import HTTPStatus
from flask import Flask, redirect, request
from flask_smorest import abort
from config_app import Config, ConfigDebug
from extensions import URI_DATABASE, APP_DEBUG, SECRET_KEY
from extensions import db, login_manager
from schemas.custom_schema import CustomApi
from models import User
# Rotas
from routes import (
    login_view, bucket_view, sector_view, manager_user_view, helpdesk_view,
)
from routes import (
    login_api, profile_api, sector_api, manager_user_api, config_helpdesk_api, 
    helpdesk_api, helpdesk_assunto_api
)

def register_api(api: CustomApi) -> CustomApi:
    '''Preenche registra as rotas de api no sistema e retorna o objeto'''
    api.register_blueprint(login_api)
    api.register_blueprint(profile_api)
    api.register_blueprint(sector_api)
    api.register_blueprint(manager_user_api)
    api.register_blueprint(config_helpdesk_api)
    api.register_blueprint(helpdesk_api)
    api.register_blueprint(helpdesk_assunto_api)

    return api

def register_app(app: Flask) -> Flask:
    ''' Registra as rotas do app flask'''
    app.register_blueprint(login_view)
    app.register_blueprint(bucket_view)
    app.register_blueprint(sector_view)
    app.register_blueprint(manager_user_view)
    app.register_blueprint(helpdesk_view)

    return app 

def login_manager_config(login_manager):
    ''' Configuracoes do login_manager'''
    @login_manager.user_loader
    def load_user(user_id):
        ''' Carrega o usuario logado'''
        user: User = User(user_id)
        if user.id == None:
            return None
        return user
    # Redirecionando o usuario para outra pagina
    @login_manager.unauthorized_handler
    def unauthorized():
        if request.blueprint.find('_api') == -1:
           return redirect('/')
        abort(HTTPStatus.UNAUTHORIZED, message='Não autorizado a acessar esta rotina')


def create_app():
    ''' Cria o aplicativo servidor para utilização '''

    app = Flask(__name__)

    if APP_DEBUG:
        app.config.from_object(ConfigDebug())
    else:
        app.config.from_object(Config())

    db.init_app(app)
    
    login_manager.init_app(app)

    login_manager_config(login_manager)

    api = CustomApi(app)

    api = register_api(api)
    app = register_app(app)

    return app