import { UserStore, type User } from '../../models/user.ts';
import { ProductStore, type Product } from '../../models/product.ts';
import { OrderStore, type Order } from '../../models/order.ts';

const userStore = new UserStore();
const productStore = new ProductStore();
const orderStore = new OrderStore();

export const seedUser = async (index: number): Promise<User> => {
  return await userStore.create({
    username: `test_user_${Date.now()}_${index}`,
    password: 'password123',
    firstName: 'Test',
    lastName: `User_${index}`,
  });
};

export const seedProduct = async (index: number): Promise<Product> => {
  return await productStore.create({
    name: `test_product_${Date.now()}_${index}`,
    price: 10 + index,
  });
};

export const seedOrder = async (userId: number): Promise<Order> => {
  return await orderStore.create({
    status: 'active',
    userId,
  });
};
