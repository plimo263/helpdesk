# -*- coding: utf-8 -*-

'''
Autor: Marcos Felipe da Silva Jardim
versao: 1.0
Data: 14-02-2023

Descricao:
    Esta lib cuida de formatar conteudo vindo como objeto e convertendo ele em tags para 
    serem usadas em corpo de mensagens cujo conteudo pode ser html (email por exemplo).
'''

def fontSizeValue(value: str) -> str:
    ''' Recebe o valor do fontSize (minimum, normal ou big) e retorna o valor correto'''
    if value == 'minimum':
        return '0.75rem'
    elif value == 'big': 
        return '1.75rem'
    else:
        return '1rem'

def textAlignValue(value: str) -> str:
    ''' Recebe o valor do textAlign e o posiciona no lugar correto'''
    if value == 'center':
        return 'center'
    elif value == 'right':
        return 'right'
    else:
        return 'left'

def style(object: dict) -> str:
    ''' Recebe um dicionario e, baseado nas opções diponiveis converte em um style inline'''
    new_object = dict()
    for k in object:
        if k == 'fontSize':
            new_object['font-size'] = fontSizeValue(object[k])
        elif k == 'bold':
            new_object['font-weight'] = 'bold'
        elif k == 'textAlign':
            new_object['text-align'] = textAlignValue(object[k])
        elif k == 'italic':
            new_object['font-style'] = 'italic'
        elif k == 'color':
            new_object['color'] = object[k]
        elif k == 'backgroundColor':
            new_object['background-color'] = object[k]
    
    style_return = [
        '{}:{}'.format(atr, new_object[atr])
    for atr in new_object
    ]
    
    return ';'.join(style_return)

def p(object: dict) -> str:
    ''' Recebe um dicionario e o formata retornando uma tag p'''
    style_format = style(object)
    text_content = []
    if 'children' in object:
        for textObject in object['children']:
            if len(textObject) > 1:
                text_content.append(span(textObject))
            else:
                text_content.append(textObject['text'])
    
    if len(style_format) > 0:
        return "<p style='{}'>{}</p>".format(style_format, ''.join(
            text_content
        ))
    else:
        return "<p>{}</p>".format(''.join(text_content))

def span(object: dict) -> str:
    ''' Recebe um objeto e retorna um span formatado'''
    style_format = style(object)
    if len(style_format) > 0:
        return "<span style='{}'>{}</span>".format(
            style_format, object['text']
        )
    else:
        return "<span>{}</span>".format( object['text'] )

def title(object: dict) -> str:
    ''' Recebe um objeto para o titulo e o retorna formatado'''
    style_format = style(object)
    text_content = []
    if 'children' in object:
        for textObject in object['children']:
            if len(textObject) > 1:
                text_content.append(span(textObject))
            else:
                text_content.append(textObject['text'])
    
    if len(style_format) > 0:
        return "<{tag} style='{style}'>{texto}</{tag}>".format(
            style=style_format, 
            texto=''.join(text_content),
            tag=object['type']
        )
    else:
        return "<{tag}>{texto}</{tag}>".format(
            tag=object['type'],
            texto=''.join(text_content)
        )

def img(object: dict) -> str:
    style_format = style(object)
    if len(style_format) > 0:
        return "<img src={url} style='{style}' />".format(
            style=style_format,
            url=object['url']
        )
    else:
        return "<img src={url} />".format( url=object['url'] )

def body_format(itens: list) -> str:
    body_content = []
    for item in itens:
        if item['type'] == 'paragraph':
            body_content.append(p(item))
        elif item['type'] == 'image':
            body_content.append(img(item))
        elif item['type'].startswith('h'):
            body_content.append(title(item))
    
    return ''.join(body_content)