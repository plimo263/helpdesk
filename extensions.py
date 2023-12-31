import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_apscheduler import APScheduler


load_dotenv()

dir_base = os.path.dirname(__file__) # Diretorio base
AVATAR_PATH = '/static/avatar'

db = SQLAlchemy() 
login_manager = LoginManager()
mail = Mail()
scheduler = APScheduler()

# Variaveis de configuração da aplicacao
URL_PUBLIC = os.getenv('URL_PUBLIC')
URI_DATABASE = os.getenv('URI_DATABASE')
SECRET_KEY = os.getenv('SECRET_KEY')
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
SMTP = os.getenv('SMTP')
SMTP_PORT = int(os.getenv('SMTP_PORT'))
EMAIL_FROM = os.getenv('EMAIL_FROM')
USE_TLS = True if os.getenv('USE_TLS') == '1' else False
USE_SSL = True if os.getenv('USE_SSL') == '1' else False
APP_DEBUG = True if os.getenv('APP_DEBUG') ==  '1' else False
SCHEDULER_API_ENABLED = True if os.getenv('SCHEDULER_API_ENABLED') == '1' else False

PATH_FILES_VARIABLES = os.path.join(dir_base, 'static', 'variados')
DIR_WEB_VARIABLES = os.path.join('/static', 'variados')