export const ENDPOINT ={
    auth:{
        login: 'auth-service/api/auth/login',
        refreshToken: 'auth-service/api/auth/refresh',
        logout: 'auth-service/api/auth/logout'
    },
    drawer:{
        detail:(idRol: string|number)=> `module-service/api/role-permission-module/menu/${idRol}`
    }
}