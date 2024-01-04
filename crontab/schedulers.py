from extensions import scheduler
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar


@scheduler.task('cron', id='auto_fechamento_ticket', hour='23', minute='59')
def auto_close_tickets():
    ''' Realiza uma execução para validar se tem tickets aguardando 
    usuario interagir a mais dias do que estão sendo informados no 
    DAYS_OF_WAIT_USER.'''
    with scheduler.app.app_context():
        HelpdeskAuxiliar.auto_fechamento_ticket()
