FROM python:3.10

# DIRETORIO INICIAL
WORKDIR /dados

COPY . /dados

## INSTALANDO AS LIBS DO PYTHON UTILIZADAS NO PROJETO
RUN apt-get update && apt-get install tzdata locales locales-all build-essential python3-dateutil python3-dev default-libmysqlclient-dev -y \
    && apt clean && pip install -r requirements.txt && task initdb

ENV TZ='America/Sao_Paulo'
ENV LC_ALL="pt_BR.UTF-8"
ENV LANG='pt_BR.UTF-8'
ENV LC_CTYPE="pt_BR.UTF-8"
ENV LC_NUMERIC="pt_BR.UTF-8"
ENV LC_MONETARY="pt_BR.UTF-8"

VOLUME ["/dados"]

#EXPONDO A PORTA 5000
EXPOSE 5000
## ATIVANDO O SERVICE
ENTRYPOINT task deploy
