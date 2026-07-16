# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. This document defines the API contract for the frontend and backend.

## API Endpoints

All routes below are expected to be served under the `/api` prefix.

### Products

- GET `/api/products` — return all products
- GET `/api/products/:id` — return a single product by id
- POST `/api/products` — create a new product (token required)
- PUT `/api/products/:id` — update an existing product (token required)
- DELETE `/api/products/:id` — delete a product (token required)

#### Product create/update payload

```json
{
  "name": "Freshie Snowboard Binding",
  "price": 199.99
}
```

#### Product response example

```json
{
  "id": 1,
  "name": "Freshie Snowboard Binding",
  "price": 199.99
}
```

### Users

- GET `/api/users` — return all users
- GET `/api/users/:id` — return a single user by id
- POST `/api/users` — create a new user
- POST `/api/users/authenticate` — authenticate a user and return a token
- PUT `/api/users/:id` — update an existing user (token required)
- DELETE `/api/users/:id` — delete a user (token required)

#### User create payload

```json
{
  "username": "jane",
  "password": "secret123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

#### User authentication payload

```json
{
  "username": "jane",
  "password": "secret123"
}
```

#### User response example

```json
{
  "id": 1,
  "username": "jane",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

> Passwords should be stored securely and should not be returned in normal API responses.

### Orders

- GET `/api/orders` — return all orders
- GET `/api/orders/:id` — return a single order by id
- POST `/api/orders` — create a new order (token required)
- PUT `/api/orders/:id` — update an existing order (token required)
- DELETE `/api/orders/:id` — delete an order (token required)
- POST `/api/orders/:id/products` — add a product to an order (token required)
- DELETE `/api/orders/:id/products/:productId` — remove a product from an order (token required)

#### Order create payload

```json
{
  "user_id": 1,
  "status": "active"
}
```

#### Order product payload

```json
{
  "productId": 2,
  "quantity": 1
}
```

#### Order response example

```json
{
  "id": 1,
  "user_id": 1,
  "status": "active"
}
```

### Dashboard

- GET `/api/dashboard/products-in-orders` — return all products that have been included in at least one order
- GET `/api/dashboard/users-with-orders` — return all users who have at least one order
- GET `/api/dashboard/most-expensive-products?limit=10` — return the N most expensive products

#### Dashboard query parameters

- `limit` (optional): number of results to return; default should be `10`

## Data Shapes

The following shapes describe the JSON payloads exchanged between the frontend and the API.

### Product

#### Product response example JSON

```json
{
  "id": 1,
  "name": "Freshie Snowboard Binding",
  "price": 199.99
}
```

#### Product field definitions

- `id`: number, required, unique
- `name`: string, required
- `price`: number, required, must be greater than or equal to 0

### User

#### User response example JSON

```json
{
  "id": 1,
  "username": "jane",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

#### User field definitions

- `id`: number, required, unique
- `username`: string, required, unique
- `firstName`: string, required
- `lastName`: string, required
- `password`: string, stored only for authentication and never returned by the API

### Order

#### Order response example JSON

```json
{
  "id": 1,
  "user_id": 1,
  "status": "active"
}
```

#### Order field definitions

- `id`: number, required, unique
- `user_id`: number, required, foreign key to `users.id`
- `status`: string, required, one of `pending`, `active`, `completed`, or `cancelled`

## Database Tables

The database should be designed to support the above API contract.

- `users`
  - `id` (primary key)
  - `username` (string, unique)
  - `password_digest` (string, hashed)
  - `first_name` (string)
  - `last_name` (string)

- `products`
  - `id` (primary key)
  - `name` (string)
  - `price` (decimal)

- `orders`
  - `id` (primary key)
  - `user_id` (foreign key to `users.id`)
  - `status` (string, one of `pending`, `active`, `completed`, or `cancelled`)

- `order_products`
  - `id` (primary key)
  - `order_id` (foreign key to `orders.id`)
  - `product_id` (foreign key to `products.id`)
  - `quantity` (number)
