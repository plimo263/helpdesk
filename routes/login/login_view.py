
from flask import Blueprint, render_template, redirect
from flask_login import current_user, login_required

blp = Blueprint('login', __name__)

@blp.route('/', methods = ['GET'])
def login():

    if current_user.is_authenticated:
        return redirect('/helpdesk')

    return render_template('template_react.html')

@blp.route('/helpdesk', methods = ['GET'])
@login_required
def helpdesk_view():

    return render_template('template_react.html')
