// Lista com os seletores utilizados na rotina de manutencao de usuarios.

export const selectorManager = (state) => state?.managerUser;
export const selectorManagerUserList = (state) => state?.managerUser?.users;
export const selectorManagerUserModal = (state) => state?.managerUser?.modal;
