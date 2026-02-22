import { Order } from "./types";

let orders: Order[] = [];

export const addOrder = (order: Order) => {
  orders.push({ ...order, timestamp: new Date().toISOString() });
};

export const getOrders = () => orders;