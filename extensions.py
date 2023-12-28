import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

load_dotenv()

# Variaveis de configuração da aplicacao
URI_DATABASE = os.getenv('URI_DATABASE')
SECRET_KEY = os.getenv('SECRET_KEY')
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
SMTP = os.getenv('SMTP')
SMTP_PORT = int(os.getenv('SMTP_PORT'))
EMAIL_FROM = os.getenv('EMAIL_FROM')
APP_DEBUG = True if os.getenv('APP_DEBUG') ==  '1' else False

db = SQLAlchemy() # Conexao ao banco de dados
login_manager = LoginManager() # Gerenciamento de login
dir_base = os.path.dirname(__file__) # Diretorio base
AVATAR_PATH = '/static/avatar'

PATH_FILES_VARIABLES = os.path.join(dir_base, 'static', 'variados')
DIR_WEB_VARIABLES = os.path.join('static', 'variados')