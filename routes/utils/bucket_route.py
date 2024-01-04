import os
import shutil
from flask import Blueprint, request
from flask_smorest import abort
from flask_login import login_required
from extensions import dir_base
from utils.files import Files

bucket = Blueprint('bucket', __name__)

DIR_BASE_BUCKET = os.path.join('/static', 'bucket')

class BucketAuxiliar:

    def move_bucket_to_man_folder(bucket_path: str, new_path: str) -> str:
        ''' Recebe uma string que representa onde o arquivo se encontra 
        no bucket e o movimenta para a pasta indicada no parametro new_path. 
        Então retorna o novo path onde o arquivo se enconta.

        Parameters:
            bucket_path: Caminho onde o arquivo se encontra no path (geralmente começa com /static)
            new_path: Caminho onde o arquivo deve ser saldo, este começa com /dados/static

        Examples:
           >>> BucketAuxiliar.move_bucket_to_man_folder('/static/bucket/item.jpg', '/dados/static/produtos')
           '/dados/static/produtos/item.jpg'
        '''
        if len(bucket_path) == 0:
            return ''
        
        new_path_item = os.path.join(new_path, os.path.basename(bucket_path))
        try:
            shutil.move(os.path.join(dir_base, *bucket_path.split('/')), new_path_item)
        except FileNotFoundError as err:
            raise err

        return new_path_item

    def move_file_to_bucket(path_full_filename: str):
        ''' Devolve o arquivo para o diretorio do bucket.
        Parameters:
           path_full_filename: Recebe o caminho completo de onde esta localizado o arquivo a ser retornado ao bucket
        Examples:
           >>> BucketAuxiliar.move_file_to_bucket('/dados/static/produtos/item.jpg')

        '''
        path_bucket = os.path.join(dir_base, *DIR_BASE_BUCKET.split('/'), os.path.basename(path_full_filename))
        try:
            shutil.move(path_full_filename, path_bucket)
        except FileNotFoundError:
            pass
    
    def file_exists_in_bucket(path_file: str) -> bool:
        ''' Verifica se o carquivo existe no bucket 
        Parameters:
            path_file: O path do arquivo (sem o /dados) a ser verificado dentro do bucket
        Examples:
            >>> BucketAuxiliar.file_exists_in_bucket('/static/bucket/imagem.png')
            True
        '''
        if os.path.exists(os.path.join(dir_base, *path_file.split('/'))):
            return True
        return False

@bucket.route('/bucket', methods = ['POST'])
@login_required
def bucket_files(**kwargs):
    
    if len(request.files) == 0:
        abort(400, message='Erro, necessário enviar arquivos')
    
    PATH_SAVE_BUCKET = os.path.join(dir_base, 'static', 'bucket')
    PATH_WEB_BUCKET = os.path.join('/static', 'bucket')

    obj_result_fields = {}

    for k in request.files:
        obj_result_fields.setdefault(k, [])
        # Salva a imagem
        return_files_path = Files.save_files(PATH_SAVE_BUCKET, request.files, False, k)
        if 'erro' in return_files_path:
            abort(400, message=f"Um ou mais arquivos do campo {k} deram problema para salvar.")
        
        # Anexa o path da imagem para ser retornado pela API
        for file_key in return_files_path:
            obj_result_fields[k].append({
                'url': os.path.join(PATH_WEB_BUCKET, return_files_path[file_key]),
            })

    return obj_result_fields