#!/bin/bash

#
# Descrição: 
# Realiza a inicialização do servidor do Helpdesk. Existem dois 
# modulos, deploy ou debug.
#
# - deploy: Usado em produção, não irá fazer auto-reload nas alterações de codigo
# - debug: Usado no desenvolvimento, qualquer alteração no codigo recarrega o servidor.
#
# ---------------------------------------------------------------
# Exemplos:
#
# ./start_app.sh debug
# ./start_app.sh deploy
#
# Já configurado para utilizar um servidor de produção gunicorn.
#

case "$1" in 
    debug)
        gunicorn -t 240 -w 1 -b 0.0.0.0:5000 --reload --access-logfile - "app:app";;
    deploy)
        gunicorn -t 480 -w 1 -b 0.0.0.0:5000 --access-logfile - "app:app";;
    *)
        echo "Digite debug ou deploy";;
esac