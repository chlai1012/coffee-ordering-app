export interface Order {
  id: string;
  menu_fk: number;
  status: string;
  customer_name: string;
  created_at: Date;
  price: number;
  selectedOptionIds?: number[];
  selectedOptions?: OptionItem[];
  menu_item?: {
    name: string;
  };
  order2option?: {
    option_item: {
      name: string;
    };
  }[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  sort: number;
  image?: string | null;
  options?: OptionItem[];
}

export interface OptionItem {
  id: number;
  name: string;
  price: number;
  is_live: boolean;
  created_at: Date;
}

export interface Option2Menu {
  id: number;
  created_at: Date;
  option_fk: number;
  menu_fk: number;
}

export interface Order2Option {
  id: number;
  created_at: Date;
  order_fk: string;
  option_fk: number;
}