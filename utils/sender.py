import os
import abc
from typing import List
from flask_mail import Message
from extensions import mail


class AttachEmail:

    def __init__(self, path: str) -> None:
        self.__path = path
    
    @property
    def path(self):
        return self.__path
    
    @property
    def filename(self):
        return os.path.basename(self.__path)

    @property
    def type_file(self) -> str:
        ''' Retorna o tipo de arquivo, se e um pdf,
        imagem, arquivo texto, etc...'''
        filename = os.path.basename(self.__path).lower()
        if filename.endswith('.pdf'):
            return 'application/pdf'
        elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
            return 'image/jpeg'
        elif filename.endswith('.png'):
            return 'image/png'
        elif filename.endswith('.mp4'):
            return 'video/mp4'
        elif filename.endswith('.mpeg'):
            return 'video/mpeg'
        elif filename.endswith('.avi'):
            return 'video/x-msvideo'
        elif filename.endswith('.rar'):
            return 'application/vnd.rar'
        elif filename.endswith('.zip'):
            return 'application/zip'
        elif filename.endswith('.xls'):
            return 'application/vnd.ms-excel'
        elif filename.endswith('.xlsx'):
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


class Sender:

    @abc.abstractmethod
    def send(self):
        ''' Realiza o envio dos dados'''
        pass

class SenderEmail(Sender):
    '''Classe usada para realizar o envio de emails 
    aos destinatários mencionados.'''

    __mail = mail

    def __init__(
            self, email_to: List, 
            email_subject: str, 
            email_body: str, 
            email_type: str = 'html', 
            email_attach: List[AttachEmail] = []
    ) -> None:
        self.__email_to = email_to 
        self.__email_body = email_body 
        self.__email_subject = email_subject
        self.__email_attach = email_attach
        self.__email_type = email_type
        self.__msg = Message()

    def __inflate_body(self):
        ''' Cria o corpo da mensagem baseado no tipo informado.'''
        if self.__email_type == 'html':
            self.__msg.html = self.__email_body
        else:
            self.__msg.body = self.__email_body
    
    def __subject_and_recipients(self):
        ''' Determina o assunto e os destinatarios'''
        self.__msg.subject = self.__email_subject
        self.__msg.recipients = self.__email_to

    def __inflate_attach(self):
        ''' Insere (se existir) os anexos a serem enviados '''
        for attach in self.__email_attach:
            with open(attach.path, 'rb') as arq:
                self.__msg.attach(
                    attach.filename,
                    attach.type_file,
                    arq.read()
                )
    
    def __send(self):
        ''' Envia o email para o destino solicitado.'''
        self.__mail.send(self.__msg)

    def send(self):
        ''' Realiza o envio do email aos destinatários mencionados.
        
        Examples:
            >>> sm = SenderEmail(['fulano@example.com'], 'Ola mundo', 'text')
            >>> sm.send()
        '''
        self.__subject_and_recipients()
        self.__inflate_body()
        self.__inflate_attach()

        self.__send()

