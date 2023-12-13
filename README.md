# Helpdek

Este é uma aplicação web para gerenciamento de helpdesks (chamados) abertos
a equipe de TI. Toda equipe, por menor que seja precisa de um processo de Helpdesk
que permita a mesma a controlar as requisições a serem feitas, para assim tornar
o trabalho bem mais organizado e eficaz.

Esta aplicação tem os seguintes recursos.

- Customização de fluxo de status
- Cadastro de Assuntos
- Padronização e modificação de cores dos status e assuntos
- Envio de email na abertura dos chamados
- Cadastro de usuários
- Cadastro de agentes (usuários que responderam sobre os chamados)
- Gráficos estatisticos dos chamados com relação de atendimentos, agentes e solicitantes.

## Como foi desenvolvido ? 🤔

Esta aplicação foi desenvolvida usando tecnologias como:

- Python-Flask (Backend)
- ReactJS (Frontend)

No backend além do Framework Flask temos as seguintes libs de apoio.

- flask-login
- flask-email
- flask-sqlalchemy
- flask-smorest

Já no frontend além da base ser em React temos as seguintes libs de apoio.

- MUI
- react-hook-form
- @uiw/react-color
- emoji-picker-react
- slate (slate-history, slate-react)
- react-use

**Entre outras**

### Como configurar ? 🔧

Este aplicativo foi desenvolvido para ser o mais customizavel possível, então você deve disponibilizar um arquivo _.env_ para que ele possa funcionar sem problemas. Este arquivo deve ser criado com as informações que são contidas no arquivo de exemplo chamado _.env_example_.

Depois de criado o arquivo .env pode-se seguir a proxima sessão de inicialização do sistema.

### Como inicializar ? 🚀

Você pode inicializar o projeto da forma como bem entender, seja por virtualenv, seja por script de inicialização ou seja por Docker.

Estarei cobrindo o uso de Docker neste caso mas via script e/ou virtualenv funciona da mesma forma.

Crie a imagem com as dependências acessando a pasta _dockerfile_ . Lá tem duas opções, o DEBUG e o DEPLOY. Para produção escolha **DEPLOY**. Acesse a pasta e crie a imagem com o seguinte comando.

```
$ docker build . -t helpdesk:latest # Dentro da pasta dockerfile/DEPLOY
```

Isso fará com que a imagem com as dependências da aplicação seja criado. Agora para de fato subir o servidor acesse a raiz do projeto e execute o seguinte comando.

```
$ docker run -d --name helpdesk --restart=always -p 8281:5000 -v $PWD:/dados helpdesk:latest
```

Não vou cobrir os paramêtros do comando Docker somente faça desta forma para que o container seja criado e possa estar ativo para utilização.

### Backend e Frontend Separados

Esta aplicação tem separação de backend/frontend sendo que o backend atua mais como uma API Rest e o frontend é desenvolvido usando React. O grande ganho desta separação esta na capacidade de se poder construir um frontend desacoplado no futuro, Ou seja, nada impede de ser construído um frontend para Desktop e/ou Mobile fazendo chamadas a API, isso torna esta aplicação boa e multiplataforma.

### Agradecimentos 🥰

Área para agradecimentos por contribuições para tornar este Helpdesk cada vez mais melhor.
