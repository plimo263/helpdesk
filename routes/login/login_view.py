
from flask import Blueprint, render_template, redirect
from flask_login import current_user

blp = Blueprint('login', __name__)

@blp.route('/', methods = ['GET'])
def login():

    if current_user.is_authenticated:
        return redirect('/helpdesk_view')

    return render_template('template_react.html')