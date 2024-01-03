from functools import wraps
from models import User 
from flask_login import current_user
from flask_smorest import abort

def is_agent(func):
    ''' Verifica se o usuario logado é o agente responsavel'''

    @wraps(func)
    def f(*args, **kwargs):

        user: User = current_user
        if not user or not user.agent:
            abort(400, message='Acesso autorizado somente para os agentes')
        
        return func(*args, **kwargs)

    return f