import {
  StatusAdjustmentStock,
  StatusAdjustmentStockSelect,
} from "@/src/types/stock_adjustment/stock_adjustment.types";

export const ENDPOINT = {
  auth: {
    login: "auth-service/api/auth/login",
    refreshToken: "auth-service/api/auth/refresh",
    logout: "auth-service/api/auth/logout",
  },
  drawer: {
    detail: (idRol: string | number) =>
      `module-service/api/role-permission-module/menu/${idRol}`,
  },
  profile: {
    infoUser: (idUser: string | number) => `user-service/api/user/${idUser}`,
    Address: (idAddress: string | number) =>
      `user-service/api/address/${idAddress}`,
  },
  categorie: {
    info: "inventory-service/api/category",
    detail: (idTenant: string | number) =>
      `inventory-service/api/category?tenant_id=${idTenant}`,
  },
  supplier: {
    info: "inventory-service/api/supplier",
    detail: (idTenant: string | number) =>
      `inventory-service/api/supplier?tenant_id=${idTenant}`,
  },
  stock: {
    detail: (idTenant: string | number) =>
      `inventory-service/api/inventory-stock/summary?tenant_id=${idTenant}`,
  },
  movement: {
    detail: (idTenant: string | number) =>
      `inventory-service/api/inventory-movement?tenant_id=${idTenant}`,
  },
  product: {
    info: "inventory-service/api/product",
    detail: (idTenant: string | number, type: string) =>
      `inventory-service/api/product?tenant_id=${idTenant}&type=${type}`,
  },
  user: {
    info: "user-service/api/user",
    detail: (idTenant: string | number) =>
      `user-service/api/user/tenant/${idTenant}`,
  },
  userBranch: {
    info: "user-service/api/user-branch",
  },
  address: {
    info: "user-service/api/address",
  },
  role: {
    info: "user-service/api/roles",
  },
  stockEntry: {
    info: "inventory-service/api/stock-entry",
    adjustment: "inventory-service/api/inventory-adjustment",
    detail: (idTenant: string | number) =>
      `inventory-service/api/stock-entry?tenant_id=${idTenant}`,
  },
  menuItem: {
    info: "menu-service/api/menu-item/full",
    detail: (idTenant: string | number) =>
      `menu-service/api/menu-item/full?tenant_id=${idTenant}`,
  },
  unitMeasure: {
    info: "inventory-service/api/unit-of-measure",
    detail: (idTenant: string | number) =>
      `inventory-service/api/unit-of-measure?tenant_id=${idTenant}`,
  },
  unitConversion: {
    info: "inventory-service/api/unit-of-measure",
  },
  merchandise: {
    info: "inventory-service/api/product/full",
    detail: (idTenant: string | number) =>
      `inventory-service/api/product/full?tenant_id=${idTenant}&type=finished_product`,
  },
  warehouse: {
    info: "inventory-service/api/warehouse",
    detail: (idTenant: string | number) =>
      `inventory-service/api/warehouse?tenant_id=${idTenant}`,
  },
  stock_count: {
    info: "inventory-service/api/stock-count",
    detailInfo: (idTenant: string | number, idWarehouse: string | number) =>
      `inventory-service/api/stock-count?tenant_id=${idTenant}&warehouse_id=${idWarehouse}`,
    detailInfoProduct: (
      idTenant: string | number,
      idWarehouse: string | number,
    ) =>
      `inventory-service/api/stock-count/stock?warehouse_id=${idWarehouse}&tenant_id=${idTenant}`,
  },
  stock_count_adjustment: {
    info: "inventory-service/api/stock-adjustment",
    changesStatus: (
      adjustment_id: string | number,
      status: StatusAdjustmentStock,
    ) => `inventory-service/api/stock-adjustment/${adjustment_id}/${status}`,
    detailInfo: (
      idTenant: string | number,
      idWarehouse: string | number,
      status: StatusAdjustmentStockSelect,
    ) =>
      `inventory-service/api/stock-adjustment?tenant_id=${idTenant}&warehouse_id=${idWarehouse}&adjustment_status=${status}`,
  },
  customerType: {
    info: `customer-service/api/type`,
    detail: (idTenant: string | number) =>
      `customer-service/api/type/tenant/${idTenant}`,
  },
  customer: {
    info: `customer-service/api/customer`,
    detail: (idTenant: string | number) =>
      `customer-service/api/customer/tenant/${idTenant}`,
  },
  loanPayments: {
    loan: (idCustomer: string | number) =>
      `customer-service/api/customer-credit/customer/${idCustomer}/payment`,
  },
  credit: {
    info: `customer-service/api/customer-credit`,
    detail: (idTenant: string | number) =>
      `customer-service/api/customer-credit?tenant_id=${idTenant}`,
    previousCredit: (idCustomer: string | number) =>
      `customer-service/api/customer-credit/customer/${idCustomer}/reverse-payment`,
  },
  warehouse_zone: {
    info: `inventory-service/api/warehouse-zone`,
    detail: (idWarehouse: string | number) =>
      `inventory-service/api/warehouse-zone?warehouse_id=${idWarehouse}`,
  },
  movement_credit: {
    detail: (idTenant: string | number) =>
      `customer-service/api/customer-credit/movements?tenant_id=${idTenant}`,
  },
  fiscalDocument: {
    detail: (idBranch: string | number) =>
      `payment-client-service/api/fiscal-document?branch_id=${idBranch}`,
  },
  wholesale: {
    info: `inventory-service/api/wholesale-rule`,
    detail: (idTenant: number | string) =>
      `inventory-service/api/wholesale-rule?tenant_id=${idTenant}`,
  },
  pos: {
    detail: (
      idWarehouse: string | number,
      idtenant: string | number,
      type: string,
    ) =>
      `inventory-service/api/pos/products?warehouse_id=${idWarehouse}&tenant_id=${idtenant}&type=${type}`,
    checkout: `payment-client-service/api/order/pos`,
  },
  payments_methods: {
    info: `payment-client-service/api/payment-method-config`,
  },
  cash_register: {
    info: `payment-client-service/api/cash-register`,
    detail: (idTenant: number | string) =>
      `payment-client-service/api/cash-register?tenant_id=${idTenant}`,
    closed: (idCashRegisterSession: number | string) =>
      `payment-client-service/api/cash-register-session/${idCashRegisterSession}/close`,
    movement: `payment-client-service/api/cash-register-movement`,
  },
  cash_register_session: {
    info: `payment-client-service/api/cash-register-session/open`,
    detail: (idTenant: number | string) =>
      `payment-client-service/api/cash-register-session?session_status=open&user_id=${idTenant}`,
  },
  cash_register_users: {
    detail: (idTenant: number | string) =>
      `payment-client-service/api/cash-register-session/available-users?tenant_id=${idTenant}`,
  },
  invenrtory: {
    detail: (
      idTenant: number | string,
      idWarehouse: number | string,
    ) => `inventory-service/api/inventory-stock/summary?tenant_id=${idTenant}&warehouse_id=${idWarehouse}
    }`,
  },
  dashboard: {
    detail: (idTenant: number | string) =>
      `inventory-service/api/inventory-stock/low-stock?tenant_id=${idTenant}`,
  },
};
