# API Documentation

This document provides details about the available API endpoints for the Expenses application.

## Authentication

All API endpoints under `/api/`, except for `/api/auth/*`, require authentication. Requests must include a valid Supabase JWT in the `Authorization` header:

```
Authorization: Bearer <YOUR_SUPABASE_JWT>
```

The middleware (`middleware.ts`) handles token validation. Unauthorized requests will receive a `401 Unauthorized` response.

## Base URL

All API routes are relative to the application's base URL.

---

## Auth Endpoints

These endpoints handle user authentication. They do **not** require the `Authorization` header.

### 1. Sign Up

*   **Endpoint:** `POST /api/auth/signup`
*   **Description:** Creates a new user account.
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "your_secure_password"
    }
    ```
*   **Responses:**
    *   `201 Created`: Signup successful. Response body includes a message and user information (note: email confirmation might be required based on Supabase settings).
    ```json
    {
      "message": "Signup successful. Check your email for confirmation (if enabled).",
      "user": { /* Supabase user object */ }
    }
    ```
    *   `400 Bad Request`: Missing email/password or signup failed (e.g., user already exists). Response body includes an error message.
    *   `500 Internal Server Error`: Unexpected server error.

### 2. Log In

*   **Endpoint:** `POST /api/auth/login`
*   **Description:** Authenticates a user and returns an access token (JWT).
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "your_password"
    }
    ```
*   **Responses:**
    *   `200 OK`: Login successful. Response body contains the access token.
    ```json
    {
      "token": "your_supabase_jwt"
    }
    ```
    *   `400 Bad Request`: Missing email/password.
    *   `401 Unauthorized`: Invalid credentials or login failed. Response body includes an error message.
    *   `500 Internal Server Error`: Unexpected server error.

---

## Category Endpoints

Endpoints for managing expense categories. Require authentication.

### 1. List Categories

*   **Endpoint:** `GET /api/categories`
*   **Description:** Retrieves categories belonging to the authenticated user. Categories are sorted by creation date (ascending).
*   **Query Parameters:** (Uses `GetCategoriesQuerySchema`)
    *   `skip` (number, optional, default: 0): Number of records to skip for pagination.
    *   `limit` (number, optional, default: 100): Maximum number of records to return (max 500).
*   **Responses:**
    *   `200 OK`: Returns an array of category objects.
    ```json
    [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "Groceries",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      },
      // ... more categories
    ]
    ```
    *   `401 Unauthorized`: Authentication failed.
    *   `500 Internal Server Error`: Database or other server error.

### 2. Create Category

*   **Endpoint:** `POST /api/categories`
*   **Description:** Creates a new category for the authenticated user.
*   **Request Body:** (Uses `CategoryCreateSchema`)
    ```json
    {
      "name": "New Category Name"
    }
    ```
*   **Responses:**
    *   `201 Created`: Returns the newly created category object.
    ```json
    {
      "id": "new-uuid",
      "user_id": "user-uuid",
      "name": "New Category Name",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```
    *   `400 Bad Request`: Invalid request body (validation error based on `CategoryCreateSchema`) or potentially failed database operation.
    *   `401 Unauthorized`: Authentication failed.
    *   `409 Conflict`: Category name might already exist (if there's a unique constraint).
    *   `500 Internal Server Error`: Database or other server error.

### 3. Update Category

*   **Endpoint:** `PATCH /api/categories/{id}`
*   **Description:** Updates the name of a specific category belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the category to update.
*   **Request Body:** (Uses partial `CategoryCreateSchema`, only `name` is updatable)
    ```json
    {
      "name": "Updated Category Name"
    }
    ```
*   **Responses:**
    *   `200 OK`: Returns the updated category object.
    ```json
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "name": "Updated Category Name",
      "created_at": "timestamp",
      "updated_at": "new-timestamp"
    }
    ```
    *   `400 Bad Request`: Invalid request body (validation error) or attempting to update fields other than `name`.
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Category with the specified ID not found or doesn't belong to the user.
    *   `409 Conflict`: Updated name conflicts with an existing category name (if unique constraint exists).
    *   `500 Internal Server Error`: Database or other server error.

### 4. Delete Category

*   **Endpoint:** `DELETE /api/categories/{id}`
*   **Description:** Deletes a specific category belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the category to delete.
*   **Responses:**
    *   `204 No Content`: Category deleted successfully.
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Category with the specified ID not found or doesn't belong to the user.
    *   `409 Conflict`: Cannot delete category because it's referenced by existing expenses (foreign key constraint).
    *   `500 Internal Server Error`: Database or other server error.

---

## Payment Method Endpoints

Endpoints for managing payment methods. Require authentication.

### 1. List Payment Methods

*   **Endpoint:** `GET /api/payment_methods`
*   **Description:** Retrieves all payment methods belonging to the authenticated user. Methods are sorted by creation date (ascending).
*   **Query Parameters:** (Uses `GetPaymentMethodsQuerySchema`)
    *   `skip` (number, optional, default: 0): Number of records to skip for pagination.
    *   `limit` (number, optional, default: 100): Maximum number of records to return (max 500).
*   **Responses:**
    *   `200 OK`: Returns an array of payment method objects.
    ```json
    [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "Credit Card",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      },
      // ... more payment methods
    ]
    ```
    *   `401 Unauthorized`: Authentication failed.
    *   `500 Internal Server Error`: Database or other server error.

### 2. Create Payment Method

*   **Endpoint:** `POST /api/payment_methods`
*   **Description:** Creates a new payment method for the authenticated user.
*   **Request Body:** (Uses `PaymentMethodCreateSchema`)
    ```json
    {
      "name": "New Payment Method Name"
    }
    ```
*   **Responses:**
    *   `201 Created`: Returns the newly created payment method object.
    ```json
    {
      "id": "new-uuid",
      "user_id": "user-uuid",
      "name": "New Payment Method Name",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```
    *   `400 Bad Request`: Invalid request body (validation error based on `PaymentMethodCreateSchema`) or potentially failed database operation.
    *   `401 Unauthorized`: Authentication failed.
    *   `409 Conflict`: Payment method name might already exist (if there's a unique constraint).
    *   `500 Internal Server Error`: Database or other server error.

### 3. Update Payment Method

*   **Endpoint:** `PATCH /api/payment_methods/{id}`
*   **Description:** Updates the name of a specific payment method belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the payment method to update.
*   **Request Body:** (Uses partial `PaymentMethodCreateSchema`, only `name` is updatable)
    ```json
    {
      "name": "Updated Payment Method Name"
    }
    ```
*   **Responses:**
    *   `200 OK`: Returns the updated payment method object.
    ```json
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "name": "Updated Payment Method Name",
      "created_at": "timestamp",
      "updated_at": "new-timestamp"
    }
    ```
    *   `400 Bad Request`: Invalid request body (validation error) or attempting to update fields other than `name`.
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Payment method with the specified ID not found or doesn't belong to the user.
    *   `409 Conflict`: Updated name conflicts with an existing payment method name (if unique constraint exists).
    *   `500 Internal Server Error`: Database or other server error.

### 4. Delete Payment Method

*   **Endpoint:** `DELETE /api/payment_methods/{id}`
*   **Description:** Deletes a specific payment method belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the payment method to delete.
*   **Responses:**
    *   `204 No Content`: Payment method deleted successfully.
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Payment method with the specified ID not found or doesn't belong to the user.
    *   `409 Conflict`: Cannot delete payment method because it's referenced by existing expenses (foreign key constraint).
    *   `500 Internal Server Error`: Database or other server error.

---

## Expense Endpoints

Endpoints for managing expenses. Require authentication.

### 1. List Expenses

*   **Endpoint:** `GET /api/expenses`
*   **Description:** Retrieves expenses belonging to the authenticated user, with optional filtering, sorting, and pagination.
*   **Query Parameters:** (Uses `GetExpensesQuerySchema`)
    *   `startDate` (ISO 8601 string, optional): Filter expenses on or after this date.
    *   `endDate` (ISO 8601 string, optional): Filter expenses on or before this date.
    *   `categoryId` (UUID, optional): Filter by category ID.
    *   `paymentMethodId` (UUID, optional): Filter by payment method ID.
    *   `type` ('income' | 'expense', optional): Filter by expense type.
    *   `skip` (number, optional, default: 0): Number of records to skip for pagination.
    *   `limit` (number, optional, default: 10): Maximum number of records to return.
*   **Sorting:** Default sort is by `timestamp` descending (newest first).
*   **Responses:**
    *   `200 OK`: Returns an array of expense objects matching the criteria.
    ```json
    [
      {
        "id": "uuid",
        "user_id": "uuid",
        "category_id": "uuid",
        "payment_method_id": "uuid",
        "amount": 100.50,
        "type": "expense", // or "income"
        "description": "Lunch",
        "timestamp": "timestamp",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      },
      // ... more expenses
    ]
    ```
    *   `400 Bad Request`: Invalid query parameters (validation error based on `GetExpensesQuerySchema`).
    *   `401 Unauthorized`: Authentication failed.
    *   `500 Internal Server Error`: Database or other server error.

### 2. Create Expense

*   **Endpoint:** `POST /api/expenses`
*   **Description:** Creates a new expense record for the authenticated user.
*   **Request Body:** (Uses `ExpenseCreateSchema`)
    ```json
    {
      "category_id": "category-uuid",
      "payment_method_id": "payment-method-uuid",
      "amount": 50.75,
      "type": "expense", // or "income"
      "description": "Coffee",
      "timestamp": "2023-10-27T10:00:00Z" // ISO 8601 format
    }
    ```
*   **Responses:**
    *   `201 Created`: Returns the newly created expense object.
    ```json
    {
        "id": "new-uuid",
        "user_id": "user-uuid",
        "category_id": "category-uuid",
        "payment_method_id": "payment-method-uuid",
        "amount": 50.75,
        "type": "expense",
        "description": "Coffee",
        "timestamp": "2023-10-27T10:00:00Z",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
    ```
    *   `400 Bad Request`: Invalid request body (validation error) or invalid `category_id`/`payment_method_id` (foreign key violation).
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Potentially if pre-checks for `category_id` or `payment_method_id` are implemented and they don't exist/belong to the user.
    *   `500 Internal Server Error`: Database or other server error.

### 3. Get Expense by ID

*   **Endpoint:** `GET /api/expenses/{id}`
*   **Description:** Retrieves a specific expense record by its ID, belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the expense to retrieve.
*   **Responses:**
    *   `200 OK`: Returns the expense object.
    ```json
    {
        "id": "uuid",
        // ... other expense fields
    }
    ```
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Expense with the specified ID not found or doesn't belong to the user.
    *   `500 Internal Server Error`: Database or other server error.

### 4. Update Expense

*   **Endpoint:** `PATCH /api/expenses/{id}`
*   **Description:** Updates specific fields of an expense record belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the expense to update.
*   **Request Body:** (Uses `ExpenseUpdateSchema` - allows partial updates of fields defined in `ExpenseCreateSchema`)
    ```json
    {
      "amount": 60.00,
      "description": "Updated Coffee description"
      // ... other fields to update
    }
    ```
*   **Responses:**
    *   `200 OK`: Returns the updated expense object.
    ```json
    {
        "id": "uuid",
        "amount": 60.00,
        "description": "Updated Coffee description",
        // ... other fields, potentially updated timestamp
    }
    ```
    *   `400 Bad Request`: Invalid request body (validation error) or invalid `category_id`/`payment_method_id` if included (foreign key violation).
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Expense with the specified ID not found or doesn't belong to the user.
    *   `500 Internal Server Error`: Database or other server error.

### 5. Delete Expense

*   **Endpoint:** `DELETE /api/expenses/{id}`
*   **Description:** Deletes a specific expense record belonging to the authenticated user.
*   **Path Parameter:**
    *   `id` (UUID): The ID of the expense to delete.
*   **Responses:**
    *   `204 No Content`: Expense deleted successfully.
    *   `401 Unauthorized`: Authentication failed.
    *   `404 Not Found`: Expense with the specified ID not found or doesn't belong to the user.
    *   `500 Internal Server Error`: Database or other server error.

---

## Analytics Endpoints

Endpoints for retrieving summarized expense data. Require authentication.

### 1. Get Expense Summary

*   **Endpoint:** `GET /api/analytics/summary`
*   **Description:** Retrieves summarized expense data based on specified criteria. **(Currently Not Implemented)**
*   **Query Parameters:** (Uses `GetAnalyticsSummaryQuerySchema`)
    *   `startDate` (ISO 8601 string): Start date for the summary period.
    *   `endDate` (ISO 8601 string): End date for the summary period.
    *   `groupBy` ('category' | 'paymentMethod' | 'type', optional): Field to group the results by.
    *   `period` ('day' | 'week' | 'month' | 'year', optional): Time period for aggregation (intended for use within backend logic, e.g., RPC function).
*   **Responses:**
    *   `200 OK`: Returns an array of summary objects (structure depends on implementation, likely `{ label: string, value: number }`).
    *   `400 Bad Request`: Invalid query parameters.
    *   `401 Unauthorized`: Authentication failed.
    *   `500 Internal Server Error`: Database or other server error.
    *   `501 Not Implemented`: The analytics calculation logic is not yet implemented. 