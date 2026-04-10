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
    },
    supplier:{
        info: 'inventory-service/api/supplier',
    },
    stock:{
        detail: (idTenant:string | number)=>`inventory-service/api/inventory-stock/summary?tenant_id=${idTenant}`
    },
    movement:{
        detail: (idTenant:string | number)=>`inventory-service/api/inventory-movement?tenant_id=${idTenant}`
    },
    product:{
        info: "inventory-service/api/product",
        detail: (idTenant:string | number)=>`inventory-service/api/product?tenant_id=${idTenant}&type=ingredient`
    },
    user:{
        info: "user-service/api/user",
        detail: (idTenant:string | number)=>`user-service/api/user/tenant/${idTenant}`
    },
    address:{
        info: "user-service/api/address"
    },
    role:{
        info: "user-service/api/roles"
    },
    stockEntry:{
        info: "inventory-service/api/stock-entry",
        adjustment: "inventory-service/api/inventory-adjustment",
        detail: (idTenant:string | number)=>`inventory-service/api/stock-entry?tenant_id=${idTenant}`
    },
    menuItem:{
        info: "menu-service/api/menu-item/full",
        detail: (idTenant:string | number)=>`menu-service/api/menu-item/full?tenant_id=${idTenant}`
    },
}