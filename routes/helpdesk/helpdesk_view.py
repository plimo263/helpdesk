from flask import render_template, Blueprint
from flask_login import login_required
from decorators.is_agent import is_agent

blp = Blueprint('helpdesk_view', __name__)

@blp.route('/helpdesk_view', methods = ['GET'])
@login_required
def helpdesk_view_page():
    return render_template('template_react.html')

@blp.route('/helpdesk_assunto_page', methods = ['GET'])
@is_agent
def helpdesk_assunto_page():
    return render_template('template_react.html')

@blp.route('/helpdesk_status_page', methods = ['GET'])
@is_agent
def helpdesk_status_page():
    return render_template('template_react.html')