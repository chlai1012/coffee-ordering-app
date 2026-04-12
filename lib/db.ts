import { Order } from "./types";

let orders: Order[] = [];

export const addOrder = (order: Order) => {
  orders.push(order);
};

export const getOrders = () => orders;