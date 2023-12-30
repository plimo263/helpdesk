import os
import json
from typing import Dict, List, Tuple
from datetime import datetime
from flask import render_template, request
from flask_login import current_user
from sqlalchemy import func, text, and_, desc, asc, label
import visao_html
from db import (
    Ticket, TicketInteracao, TicketCopia, 
    TicketAnexos, TicketAssunto, TicketStatus,
    TicketStatusDePara
)
from db import User as UserTable
from extensions import db, DIR_WEB_VARIABLES
from models import User
from models.user import UserDB 
from models.config.config_db import ConfigDB
from models.sender.sender import Sender
from utils.files import Files

POR_PAGINA = 10
DIAS_AUTO_FECHAMENTO = 'DAYS_OF_WAIT_USER'

CAMINHO_ACESSAR_ANEXO_HELPDESK = '/static/helpdesk'

class HelpdeskAuxiliar:

    @staticmethod
    def is_super_agent(id_user: int) -> bool:
        ''' Verifica se a matricula enviada é um super agente '''
        user: User = current_user
        return user.is_agent()
        # list_agents = [ 
        #     item for item in  modelo.Utils.usuarios_com_variavel(
        #         HELPDESK_SUPER_AGENTE_VAR
        #         ) 
        #         if item['id_usuario'] == id_user
        # ]
        # if len(list_agents) > 0: return True 
        # return False

    @staticmethod
    def is_agent(id_user: int) -> bool:
        ''' Verifica se a matricula enviada é um agente '''
        user: User = current_user
        return user.is_agent()
        # list_agents = [ 
        #     item for item in  modelo.Utils.usuarios_com_variavel(
        #         HELPDESK_AGENTE_VAR
        #         ) if item['id_usuario'] == id_user
        # ]
        # if len(list_agents) > 0: return True 
        # return False
    
    @staticmethod
    def update_agent_ticket(id_ticket: int, id_user: int):
        '''Realiza a atualização do ticket preenchendo o agente correto '''
        ticket: Ticket = Ticket.query.filter(Ticket.id == id_ticket).first()
        if not ticket:
            raise ValueError('O ticket não foi encontrado')

        ticket.id_agente = id_user
        try:
            db.session.add(ticket)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err

    @staticmethod
    def add_helpdesk(id_user: int, id_subject: int, title: str, id_status: int) -> Dict:
        ''' Cria o novo helpdesk no sistema e o retorna

        Parameters:
            id_user: Identificacao do solicitante
            id_subject: ID do assunto a ser tratado
            title: Titulo do helpdesk
            id_status: ID do status do helpdesk

        Exapmles:
            >>> Helpdesk.add_helpdesk(1, 1, 'PROBLEMA', 1)
            {
    
                "id": 1,
                "id_usuario": 1,
                "solicitante": "FULANO DE TAL",
                "avatar": "/static/imagens/avatar/22323.jpg",
                "email": "teste@gmail.com",
                "assunto": "Protheus",
                "agente": None,
                "status": "ABERTO",
                "atrasado": false,
                "ultima_interacao": "2023-09-12 14:40:41",
                "prazo": "2023-09-19",
                "titulo": "PROBLEMA"
            }
        '''
        # Cadastra o helpdesk
        ticket: Ticket = Ticket(
            id_usuario = id_user, 
            dtabertura = datetime.now(),
            dtfechamento = None,
            dtprazo = func.date_add(
                func.now(), 
                text(
                    f" INTERVAL ( SELECT ta.prazo FROM ticket_assunto ta WHERE ta.id = {id_subject}) DAY"
                )
             ),
            titulo = title,
            idstatus = id_status,
            idassunto = id_subject
        )

        try:
            db.session.add(ticket)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err

        # Recupera o helpdesk
        filter_helpdesk = (Ticket.id == ticket.id,)
        return HelpdeskAuxiliar.get_helpdesk_list(filter_helpdesk)[0]

    @staticmethod
    def add_interaction(id_ticket: int, id_user: int, description: str, id_status: int, id_status_to: int = None, is_first: bool = None) -> Dict:
        ''' Registra a interação e a retorna.

        Parameters:
            id_ticket: ID do ticket
            id_user: Identificacao do solicitante
            description: Descrição da interação
            id_status: ID do status a ser registrado
            id_status_to: ID do status em que a interacao irá
            is_first: Primeira interacao, acontece quando a solicitação é criada
        
        Examples:
            >>> Helpdesk.add_interaction(1, 1, '[{type: 'text', children: 'OI'}]', 1, is_first=True)
            {
              'id_interacao': 1,
              'data_interacao': "2023-10-01",
              'descricao': [{"type": "text", "children: []}],
              'id_user': 1,
              'nome': "FABIO",
              'avatar': "/static/imagens/avatar/TAPE/000504.jpg",
              'de': None,
              'para': "ABERTO",
              'anexos': [],
              'is_agente': False
            }
        '''

        if is_first:
            status_actualy = [ item for item in HelpdeskAuxiliar.get_status() if item['id'] == id_status ]
            ticket_interaction: TicketInteracao = TicketInteracao(
                idticket = id_ticket,
                dtinteracao = func.now(),
                descricao = description,
                id_usuario = id_user,
                de_interacao = None,
                para_interacao = status_actualy[0]['descricao']
            )
        else:
            status_name_of = [ item for item in HelpdeskAuxiliar.get_status() if item['id'] == id_status ][0]['descricao']
            status_name_to = [ item for item in HelpdeskAuxiliar.get_status() if item['id'] == id_status_to ][0]['descricao']
            ticket_interaction: TicketInteracao = TicketInteracao(
                idticket = id_ticket,
                dtinteracao = func.now(),
                descricao = description,
                id_usuario = id_user,
                de_interacao = status_name_of,
                para_interacao = status_name_to
            )

        try:
            db.session.add(ticket_interaction)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
        return HelpdeskAuxiliar.interactions(id_ticket)[-1]

    @staticmethod
    def update_status(id_ticket: int, idstatus: int):
        ''' Atualiza o status do ticket para o novo status informado. Caso 
        o ticket não exista um ValueError é lançado e caso não consiga 
        atualizar o status uma Exception é lançada.
        
        Parameters:
            id_ticket: O id do ticket a ser atualizado o status
            idstatus: O id do novo status do ticket

        '''

        tkt: Ticket = Ticket.query.filter(Ticket.id == id_ticket).first()
        if not tkt:
            raise ValueError('O ticket informado não existe')
        tkt.idstatus = idstatus

        try:
            db.session.add(tkt)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
    
    @staticmethod
    def ticket_finish(id_ticket: int):
        ''' Finalizacao ticket marcando a data de fechamento. Caso o ticket 
        não exista um ValueError é lançado e caso não consiga atualizar o ticket 
        um Exception é lançado.
        
        Parameters:
            id_ticket: O id do  ticket a ser finalizado no sistema
        
        '''
        tkt: Ticket = Ticket.query.filter(Ticket.id == id_ticket).first()
        if not tkt:
            raise ValueError('O ticket informado não existe')
        tkt.dtfechamento = func.now()

        try:
            db.session.add(tkt)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
    @staticmethod
    def add_copy_to_helpdesk(id_ticket: int, id_user_copy_list: List):
        ''' Registra os usuarios que devem ser copiados no ticket aberto. 
        Caso não consiga criar a copia do ticket uma Exception é lançada.

        Examples:
            >>> Helpdesk.add_copy_to_helpdesk(1, [2] )
        
        '''

        for id_user_copy in id_user_copy_list:
            tkt_copy = TicketCopia(
                idticket = id_ticket,
                id_usuario = id_user_copy
            )
            try:
                db.session.add(tkt_copy)
                db.session.commit()
            except Exception as err:
                db.session.rollback()
                raise err
    
    @staticmethod
    def save_attach_file(id_ticket: int, id_interaction: int, attach_file: str):
        ''' Registra o anexo salvo a interação ao ticket. Caso não consiga 
        registrar o anexo uma Exception é lançada. 

        Parameters:
            id_ticket: O ID do ticket a ser registrado
            id_interaction: O ID da interação do ticket que o anexo deve ser registrado
            attach_file: Uma string que representa o nome do arquivo a ser inserido

        '''
        tkt_attach: TicketAnexos = TicketAnexos(
            idinteracao = id_interaction,
            idticket = id_ticket,
            descricao = attach_file
        )

        try:
            db.session.add(tkt_attach)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err

    @staticmethod
    def get_requester() -> List[Dict]:
        ''' Recupera uma lista com os solicitantes formatados.        
        
        '''
        rows = HelpdeskAuxiliar._get_rows_details(tuple())
        set_of_requesters = { row.id_usuario for row in rows }
        
        list_of_requesters = [ {
                'id_usuario': reg.id,
                'nome': reg.name,
                'avatar': reg.avatar,
                'grupo_acesso': reg.sector_name,
                'email': reg.email,
            } for reg in UserDB().get_all_with_user() 
            if reg.id in set_of_requesters 
        ]

        return sorted(list_of_requesters, key=lambda x: x['id_usuario'])

    @staticmethod
    def get_subjects(with_situation: bool = False) -> List[Dict]:
        ''' Retorna uma lista com todos os assuntos disponiveis 
        Examples:
            >>> Helpdesk.get_subjects()
            [
              {
                'id': 1,
                'descricao': 'PROTHEUS',
                'prazo': 5,
                'total': 0,
              }
            ]
        '''
        filter = (TicketAssunto.situacao == 'A',) if not with_situation else tuple()

        rows = TicketAssunto.query.filter( *filter ).all()

        return [
            HelpdeskAuxiliar._format_subject(row)
            if with_situation else {
                'id': row.id,
                'descricao': row.descricao,
                'prazo': row.prazo,
                'total': 0,
            }
            for row in rows
        ]

    @staticmethod
    def get_total_of_subjects() -> Dict:
        ''' Retorna uma lista com o total de assuntos disponiveis de acesso ao usuario 
        Examples:
            >>> Helpdesk.get_total_of_subjects()
            {
                1: 10,
                2: 20
            }
        '''
        filter = HelpdeskAuxiliar.obter_parametro_consulta_helpdeskV2()

        rows = TicketAssunto.query\
        .join(
            Ticket, Ticket.idassunto == TicketAssunto.id
            )\
        .add_columns(
            TicketAssunto.id.label('id'),
            func.count(text('*')).label('total')
        )\
        .filter(*filter)\
        .group_by(TicketAssunto.id).all()

        return {
            row.id : row.total 
            for row in rows
        }
    
    @staticmethod
    def is_status_of_to(status_of: int, status_to: int) -> bool:
        ''' Verifica se o status_of pode ser atualizado para o status_to'''
        # Retorna um dicionario com o status_of sendo a chave e uma lista de status_to
        status_dict = HelpdeskAuxiliar.status_x_status()
        if not status_of in status_dict:
            return False
        
        is_permission = False 
        for item in status_dict[status_of]:
            if item[0] == status_to:
                is_permission = True 
                break
        return is_permission
    
    @staticmethod
    def get_status(status_name: str = None) -> List[Dict]:
        '''Retorna a lista de status disponiveis no helpdesk 
        Examples:
            >>> Helpdesk.get_status()
            [
              {
                'id': 1,
                'descricao': 'MEU STATUS',
                'total': 0,
                'cor': '#000000',
                'autorizado_interagir': 'S'
              }
            ]
        '''

        filter = (
            and_(
                TicketStatus.situacao == 'A', 
                TicketStatus.descricao == status_name 
            ),
        ) if not status_name is None else (
                TicketStatus.situacao == 'A',
            )

        rows = TicketStatus.query.filter(
            *filter
        ).all()

        return [ 
            {
                'id': row.id,
                'descricao': row.descricao,
                'total': 0,
                'cor': row.cor,
                'autorizado_interagir': row.autorizado_interagir # A (Agente) e S (Solicitante)
            } 
            for row in rows
        ]
    
    @staticmethod
    def totalizator_of_status() -> Dict:
        ''' Retorna os status com seus totalizadores baseado no usuario logado '''
        filter = HelpdeskAuxiliar.obter_parametro_consulta_helpdeskV2()

        rows = TicketStatus.query.join(
            Ticket, 
            Ticket.idstatus == TicketStatus.id
        ).add_columns(
            TicketStatus.id.label('id'), 
            func.count(text('*')).label('total')
        ).filter(*filter).group_by(
            TicketStatus.id
        ).all()

        return {
            row.id : row.total
            for row in rows
        }
    
    @staticmethod
    def status_x_status() -> Dict:
        ''' Retorna um dicionario com o status de e para onde
        este status pode ir (para)
        '''

        sub_tk_st = db.session.query(
            TicketStatus.id,
            TicketStatus.descricao,
        ).subquery()

        rows = TicketStatusDePara.query.outerjoin(
            sub_tk_st,
            sub_tk_st.c.id == TicketStatusDePara.status_para
        ).add_columns(
            TicketStatusDePara.status_de,
            TicketStatusDePara.status_para,
            sub_tk_st.c.descricao.label('descricao')
        ).all()

        dict_status = {}

        for row in rows:
            dict_status.setdefault(row.status_de, [])
            dict_status[row.status_de].append(
                [row.status_para, row.descricao]
            )
        
        return dict_status

    @staticmethod
    def get_column_name(column: str):
        ''' Retorna a coluna a ser aplicada a ordenacao dentro das disponiveis'''
        return text(column)

    @staticmethod
    def get_helpdesk_list(filter: Tuple, order_by: str = None, column_order: str = None, paginate: int = None) -> List[Dict]:
        ''' Recebe uma tupla de filtro e a aplica na consulta principal reotornando 
        uma lista de chamados que atendam ao filtro 
        '''
        # Subquery para recuperar o nome do agente
        sub_agent_name = db.session.query(
            UserTable.id,
            UserTable.nome,
        ).subquery()

        # Subquery para recuperar a ultima interacao da solicitacao
        sub_last_interaction = db.session.query(
            TicketInteracao.idticket,
            TicketInteracao.dtinteracao
        ).order_by(
            desc(TicketInteracao.dtinteracao)
        ).subquery()
        
        # Execucao de consulta
        query = Ticket.query.join(
            TicketStatus, 
            TicketStatus.id == Ticket.idstatus
        ).join(
            TicketAssunto, 
            TicketAssunto.id == Ticket.idassunto
        ).join(
            UserTable, 
            UserTable.id == Ticket.id_usuario
        ).outerjoin(
            sub_agent_name,
            sub_agent_name.c.id == Ticket.id_agente,
        ).outerjoin(
            sub_last_interaction,
            and_(
                sub_last_interaction.c.idticket == Ticket.id
            )
        ).add_columns(
            Ticket.id.label('id'),
            Ticket.id_usuario.label('id_usuario'),
            UserTable.nome.label('solicitante'),
            UserTable.email.label('email'),
            TicketAssunto.descricao.label('assunto'),
            label('nome_agente', sub_agent_name.c.nome),
            TicketStatus.descricao.label('status'),
            label('ultima_interacao', func.max(sub_last_interaction.c.dtinteracao)),
            Ticket.dtprazo.label('prazo'),
            Ticket.titulo.label('titulo')
        ).filter(*filter).group_by(Ticket.id)
        

        if order_by:
            column = HelpdeskAuxiliar.get_column_name(column_order)
            if order_by == 'asc':
                query = query.order_by(asc(column))
            else:
                query = query.order_by(desc(column))
        else:
            query = query.order_by(desc(Ticket.id))

        if not paginate is None:
            try:
                rows = query.paginate(page=paginate, per_page=POR_PAGINA)
            except:
                return []
        else:
            rows = query.all()
        
        rows_list = [
            [
                row.id,
                row.id_usuario,
                row.solicitante,
                row.email,
                row.assunto,
                row.nome_agente,
                row.status,
                row.ultima_interacao,
                row.prazo,
                row.titulo
            ] for row in rows
        ]

        user_x_avatar = { reg.id: reg.avatar for reg in UserDB().get_all_with_user() }

        return HelpdeskAuxiliar.format_tickets_recovery(rows_list, user_x_avatar)

    @staticmethod
    def obter_colunas_ordenaveis() -> dict:
        ''' Retorna uma lista de todas as colunas ordenaveis'''
        return {
            'id': 'id', 
            'solicitante': "solicitante", 
            'assunto': 'assunto',
            'agente': "nome_agente", 
            'status': 'status', 
            'ultima_alteracao': 'ultima_interacao',
            'titulo': 'titulo',
        }

    @staticmethod
    def auto_fechamento_ticket():
        ''' Realiza o auto-fechamento dos tickets que estão aguardando usuario
        [TODO]
        '''
        STATUS_AGUARDANDO = 6
        
        # Pega a o valor da variavel HELPDESK_AUTO_FECHAR que corresponde aos dias 
        # que o ticket pode ficar aberto
        days_of_wait_user = ConfigDB().get(name=DIAS_AUTO_FECHAMENTO)
        DIAS_EM_ABERTO = 10 if days_of_wait_user is None else int(days_of_wait_user.value)

        # # Recupera todos os tickets com status aguardando usuario
        # SQL = querys.HELPDESK_TICKETS.format(
        #     """
        #     WHERE t.idstatus = {} AND DATE_ADD( 
        #             DATE_FORMAT(
        #                 (SELECT MAX(dtinteracao) from ticket_interacao where idticket = t.id), 
        #                 '%Y-%m-%d'
        #             ), INTERVAL {} DAY 
        #         ) <= DATE_FORMAT(NOW(), '%Y-%m-%d')
        #     """.format(
        #         STATUS_AGUARDANDO, 
        #         DIAS_EM_ABERTO
        #     )
        # )
        # c = modelo.Consulta(SQL, *modelo.param_mysql)
        # if len(c) == 0:
        #     return False
        # # Frase que irá seguir no corpo do email marcando
        # # Como resolvido
        # FRASE_TICKET_FECHADO = [
        #     {
        #         "type": "paragraph", 
        #         "children": [
        #             {
        #                 "text": "Ticket encerrado por falta de interação há {} dias".format(
        #                     DIAS_EM_ABERTO
        #                 )
        #             }
        #         ]
        #     }
        # ]
        # #
        # for item in c.getRegistros():
        #     _ticket_id = item[0]
        #     Helpdesk.update_status(_ticket_id, STATUS_RESOLVIDO)

        #     # Aqui recupera os detalhes do ticket obter_detalhes_ticket 
        #     # para pegar as informacoes dos envolvidos
        #     _ticket_detalhes = Helpdesk.obter_detalhes_ticket(_ticket_id)

        #     # E insere o incremento na tabela de interacao sobre este status
        #     # Insere um incremento
        #     Helpdesk.add_interaction(
        #         id_ticket=_ticket_id,
        #         id_user=_ticket_detalhes['id_usuario'],
        #         description=json.dumps(FRASE_TICKET_FECHADO, ensure_ascii=False),
        #         id_status=STATUS_AGUARDANDO,
        #         id_status_to=STATUS_RESOLVIDO,
        #     )
            
        #     titulo = _ticket_detalhes['titulo']
        #     # Titulo para o email 
        #     titulo_mensagem = 'Ticket #{} [{}]'.format(_ticket_id, titulo)
            
        #     # Recupera os emails dos envolvidos
        #     _lista_emails = [
        #         reg['email']
        #         for reg in _ticket_detalhes['envolvidos'] 
        #         if not reg['email'] is None and len(reg['email']) > 0
        #     ]
        #     # Envia os emails notificando todos os envolvidos
        #     Helpdesk.enviar_email_helpdeskV2(
        #         _lista_emails, titulo_mensagem, _ticket_id
        #      )

    @staticmethod
    def is_late_ticket(status_ticket: str, date_limit: datetime) -> bool:
        ''' Verifica se o ticket esta atrasado baseado em seu status 
        e data limite para resolução
        '''
        data_atual = datetime.strptime(datetime.now().strftime('%Y-%m-%d'), '%Y-%m-%d')
        
        status_nao_atrasado = ['Encerrado', 'Resolvido']

        return (
            True if not status_ticket in status_nao_atrasado 
                and data_atual > datetime.strptime(date_limit.strftime('%Y-%m-%d'), '%Y-%m-%d') 
            else False
        )

    @staticmethod
    def format_tickets_recovery(regs: List, user_x_avatar: Dict) -> List[Dict]:
        ''' Retorna a lista de tickets enviados para um modelo 
        que pode ser retornado via JSON

        Parameters:
            regs: Uma lista com os campos do registro do ticket para formatação
        Examples:
            >>> Helpdesk.format_tickets_recovery([
                [
                    1, 
                    2, 
                    'FULANO', 
                    'email@gmail.com', 
                    'PROBLEMA', 
                    '000002', 
                    'ABERTO', 
                    '2023-10-01 08:00:00',
                    '2023-10-15',
                    'PROBLEMA COM O SISTEMA'
                ]
            ])

            [
              {
                'id': 1,
                'id_usuario': 2,
                'solicitante': 'FULANO',
                'avatar': '/static/imagens/avatar/TAPE/000001.jpg',
                'email': 'email@gmail.com', 
                'assunto': 'PROBLEMA', 
                'agente': '000002, 
                'status': 'ABERTO',
                'atrasado': False,
                'ultima_interacao': '2023-10-01 08:00:00',
                'prazo': '2023-10-15',
                'titulo': 'PROBLEMA COM O SISTEMA'
              }
            ]
        '''

        return [
            {
                'id': reg[0],
                'id_usuario': reg[1],
                'solicitante': reg[2],
                'avatar': user_x_avatar[reg[1]],
                'email': reg[3], 
                'assunto': reg[4], 'agente': reg[5], 
                'status': reg[6],
                'atrasado': HelpdeskAuxiliar.is_late_ticket(reg[6], reg[8]),
                'ultima_interacao': str(reg[7]),
                'prazo': str(reg[8]),
                'titulo': reg[9]
            }
            for reg in regs
        ]

    @staticmethod
    def obter_parametro_consulta_helpdesk():
        ''' Verifica qual o perfil do usuario e retorna o parametro where correto para filtrar os dados'''
        usuario: User = current_user
        ID_USER = usuario.id
        #
        is_agente_helpdesk = HelpdeskAuxiliar.is_agent(ID_USER)
        if is_agente_helpdesk: # Vê de todas as plantas
            SQL_PARAM_USER = " "
        else: # Ve somente suas solicitacoes
            SQL_PARAM_USER = " WHERE t.id_usuario = '{}' " .format(
            ID_USER
        )

        return SQL_PARAM_USER
    
    @staticmethod
    def obter_parametro_consulta_helpdeskV2() -> Tuple:
        ''' Verifica qual o perfil do usuario e retorna o parametro where correto para filtrar os dados'''
        usuario: User = current_user
        ID_USER = usuario.id
        #
        is_agente_helpdesk = HelpdeskAuxiliar.is_agent(ID_USER)
        if is_agente_helpdesk: # Vê de todas as plantas
            #SQL_PARAM_USER = " "
            return tuple()
        else: # Ve somente suas solicitacoes
            return (
                    Ticket.id_usuario == ID_USER,
            )

    @staticmethod
    def _get_rows_details(filter: tuple) -> List:
        ''' Retorna a lista com os detalhes sobre as interacoes '''
        # Subquery para recuperar o nome do agente
        sub_agent_name = db.session.query(
            UserTable.id,
            UserTable.nome,
        ).subquery()

        # Subquery para recuperar a ultima interacao da solicitacao
        sub_last_interaction = db.session.query(
            TicketInteracao.idticket,
            TicketInteracao.dtinteracao
        ).order_by(
            desc(TicketInteracao.dtinteracao)
        ).subquery()

        # Subquery para contar a quantidade de resulvidos
        sub_total_of_resolved = db.session.query(
            TicketInteracao.idticket,
            func.count(TicketInteracao.idticket).label('total'),
            TicketInteracao.para_interacao,
        ).group_by(TicketInteracao.idticket, TicketInteracao.para_interacao).subquery()
        

        # Execucao de consulta
        query = Ticket.query\
        .join(
            TicketStatus, TicketStatus.id == Ticket.idstatus
        ).join(
            TicketAssunto, TicketAssunto.id == Ticket.idassunto
        ).join(
            UserTable, 
            UserTable.id == Ticket.id_usuario,
        ).outerjoin(
            sub_agent_name,
            sub_agent_name.c.id == Ticket.id_agente,
        ).outerjoin(
            sub_last_interaction,
            and_(
                sub_last_interaction.c.idticket == Ticket.id
            )
        ).outerjoin(
            sub_total_of_resolved,
            and_(
                sub_total_of_resolved.c.idticket == Ticket.id,
                sub_total_of_resolved.c.para_interacao == 'Resolvido'
            )

        ).add_columns(
            Ticket.id.label('id'),
            Ticket.id_usuario.label('id_usuario'),
            UserTable.nome.label('solicitante'),
            UserTable.email.label('email'),
            Ticket.dtabertura,
            Ticket.dtfechamento,
            Ticket.dtprazo,
            label('ultima_interacao', func.max(sub_last_interaction.c.dtinteracao)),
            label('id_agente', sub_agent_name.c.id),
            label('nome_agente', sub_agent_name.c.nome),
            TicketAssunto.descricao.label('assunto'),
            TicketStatus.descricao.label('status'),
            Ticket.titulo,
            TicketStatus.autorizado_interagir,
            TicketStatus.id.label('id_status'),
            label('qtd_resolvido', sub_total_of_resolved.c.total),
        ).filter(*filter).group_by(Ticket.id)

        return query.all()

    @staticmethod
    def calculo_total_atendimentosV2() -> dict:
        ''' Obtem um dicionario com o total de itens, e a quantidade de paginas gerados'''
        filter = HelpdeskAuxiliar.obter_parametro_consulta_helpdeskV2()
        rows = HelpdeskAuxiliar._get_rows_details(filter)

        TOTAL_TICKETS = len(rows)

        # # Verifica a quantidade de tickets 
        obj = {
            'total_tickets': TOTAL_TICKETS,
            'total_paginas': 1,
        }

        try:
            resto = TOTAL_TICKETS % POR_PAGINA
            total_paginas = int(TOTAL_TICKETS / POR_PAGINA)
            obj['total_paginas'] = total_paginas + 1 if resto > 0 else total_paginas 
        except ZeroDivisionError:
            obj['total_paginas'] = 1
        return obj

    @staticmethod
    def _get_attach_files(id_interaction: List) -> Dict[int, List]:
        '''Retorna uma lista com todos os anexos encontrados para serem retornados 
        '''

        rows = TicketAnexos.query.filter(
            TicketAnexos.idinteracao.in_(id_interaction)
        ).all()

        dicts = {}
        for row in rows:
            dicts.setdefault(row.idinteracao, [])
            dicts[row.idinteracao].append(
                os.path.join(
                    CAMINHO_ACESSAR_ANEXO_HELPDESK,  
                    row.descricao 
                )
            )
        
        return dicts

    @staticmethod
    def interactions(id_ticket: int) -> List[Dict]:
        ''' Retorna detalhes de todas as interações relacionadas ao chamado '''
        sub_name_colab = db.session.query( 
            UserTable.nome,
            UserTable.id
        ).subquery()

        sub_solici = db.session.query(
            Ticket.id,
            Ticket.id_usuario,
        ).subquery()

        filter = (
            TicketInteracao.idticket == id_ticket,
        )

        rows = TicketInteracao.query.outerjoin(
            sub_name_colab,
            sub_name_colab.c.id == TicketInteracao.id_usuario,
        ).outerjoin(
            sub_solici,
            sub_solici.c.id == TicketInteracao.idticket
        ).add_columns(
            TicketInteracao.idinteracao,
            TicketInteracao.dtinteracao,
            TicketInteracao.descricao,
            TicketInteracao.id_usuario,
            label('nome', sub_name_colab.c.nome),
            TicketInteracao.de_interacao,
            TicketInteracao.para_interacao,
            label('solicitante', sub_solici.c.id_usuario),
        ).filter(*filter).order_by(
            desc(TicketInteracao.idinteracao)
        ).all()

        list_id_interactions = [row.idinteracao for row in rows ]

        dict_attachs = HelpdeskAuxiliar._get_attach_files(list_id_interactions)

        user_x_avatar = { reg.id: reg.avatar for reg in UserDB().get_all_with_user() }

        return [
            {
            'id_interacao': row.idinteracao,
            'data_interacao': str(row.dtinteracao),
            'descricao': json.loads(row.descricao),
            'id_usuario': row.id_usuario,
            'nome': row.nome,
            'avatar': user_x_avatar[row.id_usuario],
            'de': row.de_interacao if not row.de_interacao is None else None,
            'para': row.para_interacao,
            'anexos': dict_attachs[row.idinteracao] if row.idinteracao in dict_attachs else [],
            'is_agente': True if row.solicitante != row.id_usuario else False,
            }
            for row in rows
        ]
    
    @staticmethod
    def get_copy_helpdesk(id_ticket: int) -> List[Dict]:
        ''' Retorna a lista de todos os envolvidos no chamado '''

        rows = TicketCopia.query.join(
            UserTable,
            UserTable.id == TicketCopia.id_usuario
        ).add_columns(
            TicketCopia.id_usuario,
            UserTable.nome,
            UserTable.email,
        ).filter(
            TicketCopia.idticket == id_ticket
        ).all()

        user_x_avatar = { reg.id: reg.avatar for reg in UserDB().get_all_with_user() }

        return [{
                'id_usuario': row.id_usuario,
                'avatar': user_x_avatar[row.id_usuario],
                'nome': row.nome,
                'email': row.email if not row.email is None else '',
            } for row in rows 
        ]

    @staticmethod
    def obter_detalhes_ticket(ticket_id: int) -> dict:
        ''' Recebe o ticket ID e retorna um dicionario'''
        STATUS_RESOLVIDO = 3

        filter = (Ticket.id == ticket_id,)

        rows = HelpdeskAuxiliar._get_rows_details(filter)
        if len(rows) == 0:
            return {'erro': 'Ticket não encontrado', 'codigo': 99}
        
        user_x_avatar = { reg.id: reg.avatar for reg in UserDB().get_all_with_user() }

        row = rows[0]
        obj = {
            'id': row.id,
            'id_usuario': row.id_usuario,
            'nome': row.solicitante,
            'avatar': user_x_avatar[row.id_usuario],
            'email': row.email,
            'data_abertura': str(row.dtabertura),
            'data_fechamento': str(row.dtfechamento) if not row.dtfechamento is None else None,
            'data_prazo': str(row.dtprazo),
            'data_ult_interacao': str(row.ultima_interacao),
            'id_agente': row.id_agente,
            'nome_agente': row.nome_agente,
            'avatar_agente': user_x_avatar[row.id_agente] if not row.id_agente is None else None,
            'assunto': row.assunto,
            'status': row.status,
            'titulo': row.titulo,
            'autorizado_interagir': row.autorizado_interagir,
            'id_status': row.id_status,
            'bloqueado': row.id_status == STATUS_RESOLVIDO and row.qtd_resolvido > 1,
            'historico': [],
            'envolvidos': [],
        }

        obj['historico'] = HelpdeskAuxiliar.interactions(ticket_id)
        # Interacoes
        obj['envolvidos'] = HelpdeskAuxiliar.get_copy_helpdesk(ticket_id)

        return obj
    
    @staticmethod
    def obter_agentes() -> list:
        '''Recupera todos os agentes do helpdesk'''
        agentes = []
        for reg in UserDB().get_all_with_user():
            if reg.agent:
                id_user, nom, email, avatar = reg.id, reg.name, reg.email, reg.avatar
                agentes.append({
                    "email": email,
                    "id_usuario": id_user,
                    "nome": nom,
                    "avatar": avatar
                })
        return agentes

    @staticmethod
    def enviar_email_helpdeskV2(list_emails, title_message, ticket_id ):
        ''' Recebe e envia o email'''
        dados = HelpdeskAuxiliar.obter_detalhes_ticket(ticket_id)

        corpo_solicitante = render_template('helpdesk/colaborador.tpl', 
            nome=dados['nome'],
            titulo='Solicitante'
        )

        corpo_agente = render_template('helpdesk/colaborador.tpl', 
            nome=dados['nome_agente'],
            titulo='Agente'
        ) if not dados['id_agente'] is None else ''

        status_ticket = dados['status'] if not dados['status'] is None else ''

        corpo_interacao = ''
        for item in dados['historico']:
            corpo_interacao += render_template(
                'helpdesk/template_interacao.tpl', 
                enviado_por = 'agente' if item['is_agente'] else 'solicitante',
                nome=item['nome'],
                data_interacao=datetime.strptime(item['data_interacao'], '%Y-%m-%d %H:%M:%S').strftime('%d/%m/%Y %H:%M'),
                cor_status= HelpdeskAuxiliar.get_status(item['para'])[0]['cor'],
                nome_status = item['para'],
                corpo_mensagem= visao_html.body_format(item['descricao'])
            )

        corpo_email = render_template(
            'helpdesk/template_base_helpdesk.tpl', 
            corpo=corpo_interacao, 
            corpo_solicitante=corpo_solicitante, 
            corpo_agente=corpo_agente,
            status=status_ticket
        )

        sender = Sender(list_emails, corpo_email, title_message)
        sender.send_email_pdf()

    @staticmethod
    def obter_descricao_formatada(descri) -> list:
        # Mapeia a descricao para ver se existe alguma tag img. caso exista salve a imagem
        nova_descricao = []
        for desc in descri:
            if 'url' in desc:
                conteudo_base64 = desc['url'].replace('data:image/png;base64,', '').encode()
                
                novo_path_imagem = Files.save_base64( conteudo_base64 )
                if not 'erro' in novo_path_imagem:
                    desc['url'] =  request.url + os.path.join( 
                        DIR_WEB_VARIABLES, 
                        os.path.basename( novo_path_imagem['arquivo'] ) 
                    )

            nova_descricao.append(desc)
        return nova_descricao

    @staticmethod
    def is_subject_exists(id_subject: int) -> bool:
        ''' Verifica se este assunto existe '''
        ticket_subject: TicketAssunto = TicketAssunto.query.filter(TicketAssunto.id == id_subject).first()
        if not ticket_subject:
            return False
        return True

    @staticmethod
    def _format_subject(subject: TicketAssunto) -> Dict:
        ''' Format o assunto enviado e o retorna '''

        return {
            'id': subject.id,
            'descricao': subject.descricao,
            'prazo': subject.prazo,
            'situacao': subject.situacao,
        }

    @staticmethod
    def update_subject(id_subject: int, name_subject: str, praz: int, situation: str):
        ''' Recebe um assunto e aplica uma atualização sobre o mesmo'''
        if not HelpdeskAuxiliar.is_subject_exists(id_subject):
            raise ValueError('O Assunto enviado não existe')

        ticket_subject: TicketAssunto = TicketAssunto.query.filter(TicketAssunto.id == id_subject).first()
        ticket_subject.descricao = name_subject
        ticket_subject.prazo = praz 
        ticket_subject.situacao = situation
        try:
            db.session.add(ticket_subject)
            db.session.commit() 
        except Exception as err:
            db.session.rollback()
            raise err
        
        return HelpdeskAuxiliar._format_subject(ticket_subject)
    
    @staticmethod
    def add_subject(name_subject: str, praz: int):
        ''' Cria um novo assunto no sistema'''
        
        ticket_subject: TicketAssunto = TicketAssunto(
            descricao = name_subject,
            prazo = praz,
            situacao = 'A'
        )
        try:
            db.session.add(ticket_subject)
            db.session.commit() 
        except Exception as err:
            db.session.rollback()
            raise err

        return HelpdeskAuxiliar._format_subject(ticket_subject)
    
    @staticmethod
    def del_subject(id_subject: int) -> bool:
        ''' Exclui o assunto criado, caso possivel se não for possível uma excessão é lançada'''
        if not HelpdeskAuxiliar.is_subject_exists(id_subject):
            return True
        
        ticket_subject: TicketAssunto = TicketAssunto.query.filter(TicketAssunto.id == id_subject).first()
        try:
            db.session.delete(ticket_subject)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
        return True
    
    @staticmethod
    def is_status_exists(id_status: int) -> bool:
        ''' Verifica se o status existe no sistema'''
        ticket_status: TicketStatus = TicketStatus.query.filter(TicketStatus.id == id_status).first()
        if not ticket_status:
            return False 
        return True
    
    @staticmethod
    def add_status(name: str, authorized: str, color: str) -> Dict:
        ''' Realiza a inserção de um novo status no sistema.'''
        ticket_status: TicketStatus = TicketStatus(
            descricao = name,
            autorizado_interagir = authorized,
            cor = color,
            situacao = 'A',
        )

        try:
            db.session.add(ticket_status)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err
        
        return HelpdeskAuxiliar._format_status(ticket_status)

    @staticmethod
    def update_status_reg(id_status: int, name: str, authorized: str, color: str, situation: str) -> Dict:
        ''' Atualiza um status no sistema alterando nome, setor autorizado a interagir e descricao, assim como situacao'''
        if not HelpdeskAuxiliar.is_status_exists(id_status):
            raise ValueError('O status informado não existe')
        
        tkt_sts: TicketStatus = TicketStatus.query.filter(TicketStatus.id == id_status).first()
        tkt_sts.descricao = name 
        tkt_sts.autorizado_interagir = authorized
        tkt_sts.cor = color 
        tkt_sts.situacao = situation
        try:
            db.session.add(tkt_sts)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 
        
        return HelpdeskAuxiliar._format_status(tkt_sts)

    @staticmethod
    def update_status_to(id_status: int, ids_status_to: List[int]):
        ''' Atualiza a lista de opções que o status pode ir, ou seja o status de pode ir para a lista enviada.'''
        # Primeiro exclui todos os status que ele atende atualmente
        HelpdeskAuxiliar.del_status_to(id_status)

        # Agora Passa sobre a lista e inclui cada status PARA ao status DE
        for id_st_to in ids_status_to:
            try:
                tkt_from_to = TicketStatusDePara(
                    status_de = id_status,
                    status_para = id_st_to,
                )
                db.session.add(tkt_from_to)
                db.session.commit()
            except Exception as err:
                db.session.rollback()
                raise err

    @staticmethod
    def del_status_to(id_status: int):
        '''Remove a lista de status para que o status enviado pode seguir '''
        if not HelpdeskAuxiliar.is_status_exists(id_status):
            raise ValueError('O status informado não existe')
        
        try:
            TicketStatusDePara.query.filter(TicketStatusDePara.status_de == id_status).delete()
            db.session.commit()
        except Exception as err:
            raise err 

    @staticmethod
    def del_status(id_status: int):
        ''' Realiza a exclusão do status pelo ID informado'''
        HelpdeskAuxiliar.del_status_to(id_status)

        sts = TicketStatus.query.filter(TicketStatus.id == id_status).first()
        try:
            db.session.delete(sts)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise err 

    @staticmethod
    def get_status_from_to() -> List[Dict]:
        ''' Retorna um dicionario com todos os status e quais os status que eles podem seguir '''
        sub_tk_st = db.session.query(
            TicketStatus.id,
            TicketStatus.descricao,
            TicketStatus.autorizado_interagir,
            TicketStatus.situacao,
            TicketStatus.cor,
        ).subquery()

        rows_from = TicketStatusDePara.query.outerjoin(
            sub_tk_st,
            sub_tk_st.c.id == TicketStatusDePara.status_de
        ).add_columns(
            label('status_para', TicketStatusDePara.status_para),
            label('id', sub_tk_st.c.id),
            label('descricao', sub_tk_st.c.descricao),
            label('autorizado_interagir', sub_tk_st.c.autorizado_interagir),
            label('situacao', sub_tk_st.c.situacao),
            label('cor', sub_tk_st.c.cor),
        ).all()

        dict_status_from = {
            row.id: { 
                **HelpdeskAuxiliar._format_status(row), 
                'status_para_ids': [],
                'status_para': []
            } 
            for row in TicketStatus.query.all() 
        }

        for row in rows_from:
            dict_status_from.setdefault(row.id, {
                **HelpdeskAuxiliar._format_status(row),
                'status_para_ids': [],
                'status_para': []
            })

            dict_status_from[row.id]['status_para_ids'].append(
                row.status_para
            )
        
        dict_status_to = {}

        rows_to = TicketStatusDePara.query.outerjoin(
            sub_tk_st,
            sub_tk_st.c.id == TicketStatusDePara.status_para
        ).add_columns(
            label('status_de', TicketStatusDePara.status_de),
            label('id', sub_tk_st.c.id),
            label('descricao', sub_tk_st.c.descricao),
            label('autorizado_interagir', sub_tk_st.c.autorizado_interagir),
            label('situacao', sub_tk_st.c.situacao),
            label('cor', sub_tk_st.c.cor),
        ).all()

        for row in rows_to:
            dict_status_to.setdefault(row.id, {
                **HelpdeskAuxiliar._format_status(row)
            })
        
        dict_status = {}
        for k in dict_status_from:
            dict_status.setdefault(k, dict_status_from[k])
            
            dict_status[k]['status_para'] = [
                dict_status_to[id_to] 
                for id_to in dict_status_from[k]['status_para_ids']
            ]
            del dict_status[k]['status_para_ids']

        return [dict_status[k] for k in dict_status ]

    @staticmethod
    def _format_status(ticket_status) -> Dict:
        ''' Formata o ticket retornando dados do ticket formatado '''
        return {
                'id': ticket_status.id,
                'situacao': ticket_status.situacao,
                'cor': ticket_status.cor,
                'descricao': ticket_status.descricao,
                'autorizado_interagir': ticket_status.autorizado_interagir,
                'status_para': [],
            }
