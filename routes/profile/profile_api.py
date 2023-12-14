import os
from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_login import current_user, login_required
from models import User
from routes.utils.bucket_route import BucketAuxiliar
from schemas.profile.profile_schema import ProfileAvatarSchema, ProfileNameSchema, ProfilePasswordSchema
from schemas.success_schema import SuccessSchema
from schemas.user.user_schema import UserSchema
from extensions import dir_base, AVATAR_PATH

blp = Blueprint('profile', __name__, description = 'Manutenção do perfil do usuario logado')


@blp.route('/profile_user')
class ProfileUserView(MethodView):

    @login_required
    @blp.response(200, UserSchema)
    def get(self):
        ''' Retorna informações do usuário atualmente autenticado.'''
        user: User = current_user

        return user.to_dict()

@blp.route('/profile_name')
class ProfileNameView(MethodView):

    @login_required
    @blp.arguments(ProfileNameSchema)
    @blp.response(200, SuccessSchema)
    def post(self, item_data):
        ''' Atualiza o nome do usuário'''
        user: User = current_user

        user.set_name(item_data['name'])

        return {'sucesso': 'Nome atualizado com sucesso.'}

@blp.route('/profile_avatar')
class ProfileAvatarView(MethodView):

    @login_required
    @blp.arguments(ProfileAvatarSchema)
    @blp.response(200, SuccessSchema)
    def post(self, item_data):
        ''' Atualiza o avatar do usuário'''
        user: User = current_user

        if not BucketAuxiliar.file_exists_in_bucket(item_data['avatar']):
            abort(400, message='Avatar não enviado')

        path_save = os.path.join(dir_base, *AVATAR_PATH.split('/'))
        
        BucketAuxiliar.move_bucket_to_man_folder(item_data['avatar'], path_save)

        user.set_avatar(os.path.basename(item_data['avatar']))

        return {'sucesso': 'Avatar atualizado com sucesso.'}
    
@blp.route('/reset_password')
class ProfilePasswordView(MethodView):

    @login_required
    @blp.arguments(ProfilePasswordSchema)
    @blp.response(200, SuccessSchema)
    def post(self, item_data):
        ''' Atualiza a senha do usuário'''
        user: User = current_user

        if not user.is_password_valid(item_data['password']):
            abort(400, message='A senha enviada não é a senha atual utilizada. Não é possível atualizar')

        user.set_password(item_data['new_password'])

        return {'sucesso': 'Senha atualizada com sucesso.'}