import abc
from typing import Dict, List
from flask_login import current_user
from models import User 
from models.user.user_db import UserDB
from routes.helpdesk.helpdesk_auxiliar import HelpdeskAuxiliar


class HelpdeskQuery:
    @abc.abstractmethod
    def get_data_query(self) -> Dict:
        ''' Retorna a representação dos dados baseado na consulta'''
        pass

class HelpdeskQueryData(HelpdeskQuery):

    def __init__(self) -> None:
        self.__user: User = current_user

    def __get_colab_formatter(self) -> List[Dict]:
        ''' Retorna a lista de colaboradores formatados '''
        colab_formatter = []

        for _colab in  UserDB().get_all_with_user():
            if _colab.id == self.__user.id:
                continue
            obj = {
                'id_usuario': _colab.id,
                'nome': _colab.name,
                'email': _colab.email,
                'grupo_acesso': _colab.sector_name
            }
            colab_formatter.append(obj)

        return colab_formatter 

    def __get_agents_formatter(self) -> List[Dict]:
        ''' Recupera a lista de agentes formatados '''
        return HelpdeskAuxiliar.obter_agentes()

    def __get_applicants_formatter(self) -> List[Dict]:
        ''' Recupera a lista de solicitantes formatados '''
        if HelpdeskAuxiliar.is_agent(self.__user.id):
            return HelpdeskAuxiliar.get_requester()
        
        return [
            { 'matricula': self.__user.id, 'nome': self.__user.name }
        ]

    def get_data_query(self) -> Dict:
        ''' Realiza a consulta e retorna os dados solicitados como um dicionario.
        
        Examples:
            >>> hq = HelpdeskQueryData()
            >>> hq.get_data_query()
            {
                "agentes": [
                    {
                        "avatar": null,
                        "email": "admin@helpdesk.com",
                        "id_usuario": 1,
                        "nome": "Admin"
                    }
                ],
                "colaboradores": [
                    {
                        "email": "user@helpdesk.com",
                        "grupo_acesso": "Recursos Humanos",
                        "id_usuario": 2,
                        "nome": "Fulano de tal"
                    }
                ],
                "solicitantes": []
            }
        '''
        return {
            'colaboradores': self.__get_colab_formatter(),
            'agentes': self.__get_agents_formatter(),
            'solicitantes': self.__get_applicants_formatter(),
        }

class HelpdeskQueryDataStatistics(HelpdeskQuery):
    def get_data_query(self) -> Dict:
        ''' Realiza a consulta e retorna os dados solicitados como um dicionario.
        
        Examples:
            >>> hq = HelpdeskQueryDataStatistics()
            >>> hq.get_data_query()
            {
                "assunto": [
                    {
                        "descricao": "Rede",
                        "id": 1,
                        "prazo": 7,
                        "total": 0
                    }
                ],
                "status": [
                    {
                        "autorizado_interagir": "A",
                        "cor": "#4caf50",
                        "descricao": "Aberto",
                        "id": 1,
                        "total": 0
                    }
                ],
                "status_de_para": {
                    "1": [
                        [2, "Encerrado"]
                    ]
                },
                "total_paginas": 0,
                "total_tickets": 0
            }
        '''
        dados = {
                'assunto': [],
                'status': [],
                'status_de_para': {},
            }
        dados.update(HelpdeskAuxiliar.calculo_total_atendimentosV2())

        dados['assunto'] = HelpdeskAuxiliar.get_subjects()

        # Contabilizar quantos helpdesks relacionados aos assuntos
        assunto_x_total = HelpdeskAuxiliar.get_total_of_subjects()

        for assunto in dados['assunto']:
            if assunto['id'] in assunto_x_total:
                assunto['total'] = assunto_x_total[assunto['id']]

        # Obtem os status
        dados['status'] = HelpdeskAuxiliar.get_status()

        # Contabilizar quantos helpdesks relacionados aos assuntos
        status_x_total = HelpdeskAuxiliar.totalizator_of_status()
        for status in dados['status']:
            if status['id'] in status_x_total:
                status['total'] = status_x_total[status['id']]

        # Status vs Status
        dados['status_de_para'] = HelpdeskAuxiliar.status_x_status()

        return dados

class HelpdeskQueryDataPage(HelpdeskQuery):
    def __init__(self, page: int, order: str = None, column: str = None) -> None:
        self.__page = page
        self.__order = order 
        self.__column = column

    def get_data_query(self) -> List:
        ''' Retorna a lista de helpdesk disponiveis.'''
        filter = HelpdeskAuxiliar.obter_parametro_consulta_helpdeskV2()

        value_page = self.__page
        ordem = self.__order
        coluna = self.__column

        return HelpdeskAuxiliar.get_helpdesk_list(
            filter, ordem, coluna, value_page
        )

class HelpdeskQueryDataTicket(HelpdeskQuery):
    def __init__(self, ticket_id: int) -> None:
        self.__ticket_id = ticket_id

    def get_data_query(self) -> Dict:
        ''' Retorna detalhes do ticket informado no filtro.'''
        return HelpdeskAuxiliar.obter_detalhes_ticket(self.__ticket_id)