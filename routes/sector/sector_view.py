from flask import Blueprint, render_template
from flask_login import login_required

blp = Blueprint('sector_view', __name__)

@blp.route('/sector_view')
@login_required
def sector_view():

    return render_template('template_react.html')