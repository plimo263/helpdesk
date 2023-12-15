from flask import Blueprint, render_template
from flask_login import login_required

blp = Blueprint('manager_user_view', __name__)

@blp.route('/manager_user_view')
@login_required
def manager_user_view():

    return render_template('template_react.html')