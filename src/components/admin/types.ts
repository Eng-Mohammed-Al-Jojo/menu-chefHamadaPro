export type PopupType =
  | "logout"
  | "addCategory"
  | "deleteCategory"
  | "addSubcategory"
  | "deleteSubcategory"
  | "editItem"
  | "deleteItem"
  | "editSubcategory"
  | "categoryImage"
  | "subcategoryImage"
  | null;

export interface PopupState {
  type: PopupType;
  id?: string;
  parentId?: string; // For subcategories
}

export interface Category {
  id: any;
  order: number;
  name?: string;
  nameAr: string;
  image?: string;
  createdAt: number;
  visible: boolean;
  available?: boolean;
}

export interface Subcategory {
  id: string;
  name?: string;
  nameAr: string;
  nameEn?: string;
  image?: string;
  categoryId: string;
  order: number;
  visible: boolean;
  available?: boolean;
  createdAt: number;
}

export interface Item {
  id: string;
  image?: string;
  name?: string;
  nameAr: string;
  price: string;
  priceTw?: string;
  ingredients?: string;
  ingredientsAr?: string;
  categoryId: string;
  subcategoryId?: string;
  visible: boolean;
  createdAt: number;
  star?: boolean;
  order?: number;
}
