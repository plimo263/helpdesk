from operator import itemgetter
from flask_login import login_required, current_user
from flask import redirect
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from werkzeug.security import generate_password_hash, check_password_hash
from schemas.login.login_schema import LoginSchema 
from models.user.user import User
from models.user import UserAuth
from schemas.user.user_schema import UserSchema

blp = Blueprint('login_api', __name__, description = 'Api para login')

@blp.route('/')
class LoginView(MethodView):

    @blp.arguments(LoginSchema)
    @blp.response(200, LoginSchema)
    def post(self, item_data):
        ''' Autenticação do usuario '''
        email, password = itemgetter('username', 'password')(item_data)

        user: User = UserAuth().login(email, password)
        if not user:
            abort(400, message='Usuário e/ou senha incorretos ou usuário inativo.')

        return {'sucesso': 'Usuário autenticado com sucesso !'}

@blp.route('/logout')
class LogoutView(MethodView):

    @login_required
    def get(self):
        '''Logout da aplicação, limpa cookies e faz saída do aplicativo.'''
        UserAuth().logout()

        return redirect('/')


