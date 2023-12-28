import os
import smtplib
from typing import List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email import encoders
from extensions import EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, SMTP, SMTP_PORT

class Sender:

    def __init__(self, list_of_emails: List[str], body_email: str, subject, path_pdf = None, subtype = 'html') -> None:
        self.__list_of_emails = list_of_emails
        self.__body_email = body_email
        self.__subject = subject
        self.__path_pdf = path_pdf
        self.__subtype = subtype

    def send_email_pdf(self):
        ''' Realiza o envio de email com anexo caso exista algum anexo a ser inserido.'''
        usuario = EMAIL_USER
        senha = EMAIL_PASSWORD
        
        msg = MIMEMultipart(_charset = 'utf-8')
        de = EMAIL_FROM
        # Lista de emails que receberam o email enviado
        lista = self.__list_of_emails
        
        msg["From"] = de
        msg["To"] = ';'.join( lista )
        msg["Subject"] = self.__subject

        msg.attach(MIMEText(self.__body_email, self.__subtype, _charset='utf-8'))

        if not self.__path_pdf is None and len(self.__path_pdf) > 0:
            payload = MIMEBase('application', 'octate-stream', Name=os.path.basename(self.__path_pdf))
            # Abra o arquivo pdf
            with open(self.__path_pdf, 'rb') as arq:
                payload.set_payload(arq.read())
            
            encoders.encode_base64(payload)
            payload.add_header('Content-Decomposition', 'attachment', filename=os.path.basename(self.__path_pdf))

            msg.attach(payload)
        
        smtp = smtplib.SMTP(SMTP, SMTP_PORT)
        smtp.connect(SMTP, SMTP_PORT)
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(usuario, senha)

        smtp.sendmail(de, lista, msg.as_string())
        smtp.quit()
