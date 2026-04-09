export type Permission = { id: number; key: string };
export type Module = {
  id: number;
  name: string;
  icon: string;
  path: string;
  parent_id: number | null;
  permissions: Permission[];
  children?: Module[];
};

