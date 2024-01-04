from collections import OrderedDict
from typing import List, Tuple
from sqlalchemy import func, text, desc, and_
from db import Sector, TicketStatus, TicketAssunto, Ticket, User as UserTable
from extensions import db, URI_DATABASE
from utils.dates import DateFormat

is_sqlite = True if URI_DATABASE.find('sqlite') != -1 else False

class HelpdeskGestaoAuxiliar:

    @staticmethod
    def ticket_by_status(filter: Tuple) -> List:
        ''' Retorna a quantidade de ticket por status'''
        status_dict = []
        rows = db.session.query(
            TicketStatus.descricao.label('name'),
            func.count(text('*')).label('total'),
            Ticket.idstatus.label('id_status')
        ).select_from(TicketStatus).join(
            Ticket, Ticket.idstatus == TicketStatus.id
        )\
        .filter(*filter)\
        .group_by(TicketStatus.descricao, Ticket.idstatus).order_by(desc(text('total'))).all()

        for row in rows:
            status_dict.append(
                [ row.name, row.total, row.id_status ]
            )

        return status_dict
    
    @staticmethod
    def ticket_by_agent(filter: Tuple) -> List:
        ''' Retorna a quantidade de ticket por agente'''
        agent_dict = []
        rows = db.session.query(
            UserTable.nome.label('name'),
            func.count(text('*')).label('total'),
            Ticket.id_agente.label('id_agent')
        ).select_from(UserTable).join(
            Ticket, Ticket.id_agente == UserTable.id
        )\
        .filter(*filter)\
        .group_by(UserTable.nome, text('id_agent')).order_by(desc('total')).all()
        
        for row in rows:
            agent_dict.append([
                row.name.title(), row.total, row.id_agent
            ])

        return agent_dict

    @staticmethod
    def ticket_by_subject(filter: Tuple) -> List:
        ''' Retorna a quantidade de ticket por assunto'''
        subject_reg = []
        rows = db.session.query(
            TicketAssunto.descricao.label('name'),
            func.count(text('*')).label('total'),
            Ticket.idassunto.label('id_assunto'),
        ).select_from(TicketAssunto).join(
            Ticket, Ticket.idassunto == TicketAssunto.id
        )\
        .filter(*filter)\
        .group_by(text('name'), text('id_assunto')).order_by(desc(text('total'))).all()

        for row in rows:
            
            subject_reg.append([
                row.name, row.total, row.id_assunto
            ])

        return subject_reg
    
    @staticmethod
    def ticket_by_user(filter: Tuple) -> List:
        ''' Retorna a quantidade de ticket por usuario'''
        user_reg = []
        rows = db.session.query(
            UserTable.nome.label('name'),
            func.count(text('*')).label('total'),
            Ticket.id_usuario.label('id_user')
        ).select_from(UserTable).join(
            Ticket, Ticket.id_usuario == UserTable.id
        )\
        .filter(*filter)\
        .group_by(UserTable.nome, text('id_user')).order_by(desc('total')).all()
        
        for row in rows:
            user_reg.append([
                row.name.title(), row.total, row.id_user
            ])
        
        return user_reg

    @staticmethod
    def ticket_by_month(filter: Tuple) -> List:
        ''' Retorna a quantidade de ticket por mes'''
        subject_dict = OrderedDict({
            n: 0 for n in range(1, 13)
        })

        field_time = (
            func.STRFTIME(text("'%m'"), Ticket.dtabertura) 
            if is_sqlite else 
            func.date_format(Ticket.dtabertura, '%m')
        )

        rows = db.session.query(
            field_time.label('name'),
            func.count(text('*')).label('total')
        ).filter(*filter)\
        .group_by(text('name')).order_by(desc(text('total'))).all()

        for row in rows:
            subject_dict[int(row.name)] = row.total
        
        return [ [ DateFormat().map_month(k), subject_dict[k] ] for k in subject_dict ]
    
    @staticmethod
    def ticket_total(filter: Tuple) -> List:
        ''' Retorna a quantidade total de tickets'''
        return [['total', Ticket.query.filter(*filter).count() ]]

    @staticmethod
    def ticket_by_sector(filter: Tuple) -> List:
        ''' Retorna a quantidade de ticket por setor'''
        user_dict = []
        rows = db.session.query(
            Sector.nome.label('name'),
            func.count(text('*')).label('total'),
            UserTable.id_setor.label('id_grupo_acesso'),
        ).select_from(UserTable).join(
            Ticket, Ticket.id_usuario == UserTable.id
        ).join(
            Sector, Sector.id == UserTable.id_setor
        )\
        .filter(and_(*filter, UserTable.id_setor != None))\
        .group_by(text('name'), text('id_grupo_acesso')).order_by(desc(text('total'))).all()
        
        for row in rows:
            user_dict.append([
                row.name.title(), row.total, row.id_grupo_acesso,
            ])

        return user_dict
    
    @staticmethod
    def ticket_by_time_medium_subject(filter: Tuple) -> List:
        ''' Retorna o tempo medio de atendimento por assunto'''
        subject_time_reg = []

        field_time = (
            func.ROUND((func.JULIANDAY(Ticket.dtabertura) - func.JULIANDAY(Ticket.dtfechamento)) * 3600 )
            if is_sqlite else 
            func.sum(func.timestampdiff(text('MINUTE'), Ticket.dtabertura, Ticket.dtfechamento))
        )
        rows = db.session.query(
            TicketAssunto.descricao.label('name'),
            field_time.label('tempo'),
            func.count(text('*')).label('total')
        ).select_from(TicketAssunto).join(
            Ticket, Ticket.idassunto == TicketAssunto.id
        )\
        .filter(and_(
            *filter,
            Ticket.dtfechamento != None
        ))\
        .group_by(text('name')).order_by(desc(text('total'))).all()

        for row in rows:
            # Calcular o tempo medio
            #tempo_medio = modelo.Data.convert_min_by_hour(row.tempo / row.total )
            tempo_medio = int((row.tempo / row.total ))
            subject_time_reg.append([
                row.name, tempo_medio, row.total
            ])

        return subject_time_reg