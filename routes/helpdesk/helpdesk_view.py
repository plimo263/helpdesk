from flask import render_template, Blueprint
from flask_login import login_required

blp = Blueprint('helpdesk_view', __name__)

@blp.route('/helpdesk_view', methods = ['GET'])
@login_required
def helpdesk_view():

    return render_template('template_react.html')