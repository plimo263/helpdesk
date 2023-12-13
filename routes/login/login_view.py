
from flask import Blueprint, render_template, request

blp = Blueprint('login', __name__)

@blp.route('/', methods = ['GET'])
def login():

    return render_template('template_react.html')
