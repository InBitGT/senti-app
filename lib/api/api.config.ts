export const ENDPOINT ={
    auth:{
        login: 'auth-service/api/auth/login',
        refreshToken: 'auth-service/api/auth/refresh',
        logout: 'auth-service/api/auth/logout'
    },
    drawer:{
        detail:(idRol: string|number)=> `module-service/api/role-permission-module/menu/${idRol}`
    },
    profile:{
        infoUser:(idUser:string|number)=>`user-service/api/user/${idUser}`,
        Address:(idAddress:string| number)=>`user-service/api/address/${idAddress}`
    },
    categorie:{
        info: 'inventory-service/api/category',
        detail: (idTenant:string | number)=>`inventory-service/api/category?tenant_id=${idTenant}`
    }
}