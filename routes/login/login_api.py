from operator import itemgetter
from flask_login import login_user, login_required, logout_user
from flask import redirect
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from werkzeug.security import generate_password_hash, check_password_hash
from schemas.login.login_schema import LoginSchema 
from models import User

blp = Blueprint('login_api', __name__, description = 'Api para login')

@blp.route('/')
class LoginView(MethodView):

    @blp.arguments(LoginSchema)
    @blp.response(200, LoginSchema)
    def post(self, item_data):
        ''' Autenticação do usuario '''
        email, password = itemgetter('username', 'password')(item_data)

        user: User = User.query.filter( User.email == email ).first()

        if not user or not check_password_hash(user.senha, password):
            abort(400, message='Usuário e/ou senha incorretos')
        
        # Agora registra o login
        login_user(user)

        return {'sucesso': 'Usuário autenticado com sucesso !'}

@blp.route('/logout')
class LogoutView(MethodView):

    @login_required
    def get(self):
        '''Logout da aplicação, limpa cookies e faz saída do aplicativo.'''
        logout_user()

        return redirect('/')


