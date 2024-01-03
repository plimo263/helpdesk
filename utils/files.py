"""
Classe usada para salvar arquivos no sistema de arquivos do projeto
"""
import os
import base64
import time
from hashlib import sha1
from PIL import Image, ExifTags
from extensions import PATH_FILES_VARIABLES

class Files:
    @staticmethod
    def save_files(caminho: str, lista_files, retorno_nome_original: bool = False, nome_campo_arquivo: str = 'arquivo'):
        ''' Recebe um caminho e um objeto request.files onde se faz validacao para salvar os arquivos.
        Parameters:
            caminho : Path para salvar os arquivos
            lista_files : Objeto request.files para obter a lista de arquivos
            retorno_nome_original : Define se o nome original deve ser mantido no retorno
            nome_campo_parquivo : Informa de qual request.form deseja-se extrair os arquivos
        Examples:
            >>> Utils.save_files('/dados/static/imagens', request.files)
             {'0': 'abcdefg.png', '1': 'xzy.png'} 
            
            >>> Utils.save_files('/dados/static/imagens', request.files, True) 
            {0: {'novo_nome': 'sfe234421323.png', 'nome_original': 'foto.png' }}

            >>> Utils.save_files('/dados/static/imagens', request.files, True, 'imagens') 
            {0: {'novo_nome': 'sfe234421323.png', 'nome_original': 'foto.png' }}
        '''
        
        # Verifica se tem ao menos um arquivo
        arquivos = lista_files.getlist(nome_campo_arquivo)
        #
        arquivos_salvos = {}
                    
        if len(arquivos) < 1:
            return {'erro': 'Se esta tentando enviar anexo, coloque ao menos 1', 'codigo': 19}
        
        # Gera o nome para cada arquivo e os armazena
        for n, arquivo in enumerate(arquivos, 1):
            if len(arquivo.filename) < 1 or arquivo.filename.find('.') == -1:
                return {'erro': 'O anexo inserido nao tem arquivo', 'codigo': 19}
            novo_nome = sha1( str( time.time() + n ).encode() ).hexdigest()
            # Divide o nome do arquivo e extensao
            
            _, ext = arquivo.filename.rsplit('.', 1)
            # Salve o arquivo
            novo_nome = '{}.{}'.format(novo_nome, ext)

            CAMINHO = os.path.join(caminho, novo_nome )

            arquivo.save( CAMINHO )
            # Agora verifica se é uma imagem, caso seja precisa aplicar 
            # Uma verificação para saber se terá que rotaciona-la
            if ext.lower() in ['png', 'jpg', 'jpeg']:
                Files.rotate_image(CAMINHO)
            # Casos onde queremos ter o retorno do nome original tambem
            if retorno_nome_original:
                arquivos_salvos[n] = {
                    'novo_nome': novo_nome,
                    'nome_original': arquivo.filename
                }
            else:
                arquivos_salvos[n] = novo_nome
        return arquivos_salvos
    
    @staticmethod
    def rotate_image(filepath: str, size: tuple = None, novo_nome: str = None) -> bool:
        """Coloca a imagem na orientação correta. Fotos retiradas de câmeras 
        de celular quando salvas diretamente podem ficar com a orientação incorreta, 
        para resolver isto este método foi criado. Ele recebe o caminho até a imagem, 
        o tamanho (size) que se informado deve ser uma tupla e o novo_nome que nada 
        mais é que o caminho para salvar a nova imagem, 
        isto faz com que o arquivo original não seja sobreescrito.

        Parameters:
            filepath: Local no sistema de arquivos onde a imagem original esta
            size: Uma tupla que determina a larguraxaltura que a nova imagem será salva
            novo_nome: Determina um novo caminho para salvar a imagem tratada e acertada.
        
        Examples:
            >>> Utils.rotate_image(os.path.join(config.DIR_BASE, 'backup', 'foto.png', (64,64), os.path.join(config.DIR_BASE, 'backup', 'thumbnail','foto.png')
            True
        """
        try:
            image = Image.open(filepath)
            exf = None
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == "Orientation":
                    exf = orientation
            if not exf is None and not image._getexif() is None:
                exif = dict(image._getexif().items())

                if exif[exf] == 3:
                    image = image.transpose(Image.ROTATE_180)
                elif exif[exf] == 6:
                    image = image.transpose(Image.ROTATE_270)
                elif exif[exf] == 8:
                    image = image.transpose(Image.ROTATE_90)

            # Se tiver a tupla de dimensoes, defina e salve
            if not size is None:
                image.thumbnail(size)
            # Se tiver o novo nome então salve neste novocaminho
            if not novo_nome is None:
                image.convert('RGB').save(novo_nome, quality=100, subsampling=0)
            else:
                #image.save(filepath, quality=100)
                image.convert('RGB').save(filepath,  quality=100, subsampling=0)
            image.close()
            return True
        except (AttributeError, KeyError, IndexError):
            # cases: image don't have getexif
            print("ERRO FUNCAO DE ROTACIONAR IMAGEM")
            return False
    
    @staticmethod
    def save_base64(content_base64, path_to_save: str = PATH_FILES_VARIABLES, ext: str = 'jpg') -> dict:
        ''' Recebe um conteudo base64 e salva no caminho retornando o local onde o arquivo foi salvo '''
        retorno = {}

        novo_nome = sha1( str(time.time()).encode() ).hexdigest()
        nome_g = os.path.join(path_to_save, '{}.{}'.format(novo_nome, ext) )
        with open(nome_g, 'wb') as arq:
            arq.write(base64.decodebytes(content_base64) )
        #
        retorno['arquivo'] = nome_g

        im = Image.open(nome_g)
        larg, alt = im.size
        Files.rotate_image(nome_g, (larg, alt))

        return retorno

