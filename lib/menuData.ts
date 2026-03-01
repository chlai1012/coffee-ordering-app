export interface MenuItemType {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const menuItems: MenuItemType[] = [
  {
    id: "latte",
    name: "Latte",
    price: 4.2,
    image: "/latte.jpg",
  },
  {
    id: "espresso",
    name: "Espresso",
    price: 2.4,
    image: "/espresso.jpg",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    price: 4.0,
    image: "/cappuccino.jpg",
  },
];