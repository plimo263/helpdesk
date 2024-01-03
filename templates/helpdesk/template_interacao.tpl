
    <div style="position: relative; margin-left: auto; margin-right: auto; padding: 16px; margin: 8px; margin-bottom: 16px; border-radius: 4px;" class="resposta-{{ enviado_por }}">
        <div>
            <span>{{ nome }} &nbsp;&nbsp;<span style="font-weight: bold;"> {{ data_interacao }}</span></span>
            &nbsp;&nbsp;
            <span class="chip-status" style="float: right; background-color: {{ cor_status }}; color: white">{{ nome_status }}</span>
        </div>
        <br />
        <hr />
        {{ corpo_mensagem }}
    </div>
