# Code Review: `mobile/src/services/api.ts`

This document serves as a technical breakdown and review of the API service layer in the mobile application, prepared for a Senior Technical Lead.

## 1. Code Overview & Walkthrough

The file `api.ts` is the central networking layer for the customer-facing mobile application. It acts as an abstraction over the `axios` library to interact with the backend REST API.

### Key Components:

1.  **Type Definitions**:
    -   `OrderData`: Defines the payload structure for creating an order (pickup, drop, load details).
    -   `Order`: Extends `OrderData` with backend-generated fields (`_id`, `status`, timestamps).
    -   `ApiResponse<T>`: A generic wrapper ensuring consistent response handling (`success`, `data`, `error`).

2.  **Axios Instance Configuration**:
    -   A singleton `api` instance is created with a base URL (`${API_URL}/api`), a 10-second timeout, and JSON headers.
    -   This centralization allows for future global configurations (e.g., auth tokens).

3.  **Service Methods (`orderAPI`)**:
    -   `createOrder`: Sends a POST request to `/orders`.
    -   `getPendingOrders`: Fetches a list of orders via GET `/orders`.
    -   `getOrderById`: Fetches details of a specific order via GET `/orders/:id`.
    -   **Error Handling**: Each method wraps the call in a `try/catch` block, attempting to return the backend's error message (`axiosError.response?.data`) or falling back to a generic error message.

## 2. System Design Analysis

### ✅ What is Good (Current Strengths)

1.  **Strong Typing**: The extensive use of TypeScript interfaces (`Order`, `ApiResponse<T>`) ensures compile-time safety. The frontend knows exactly what shape of data to expect, reducing runtime crashes due to undefined properties.
2.  **Centralized Configuration**: Using `axios.create` is a best practice. It means we can easily change the `baseURL` or add default headers (like `Authorization`) in one place without refactoring every API call.
3.  **Separation of Concerns**: The UI components (`BookingScreen`, etc.) do not make direct `fetch` or `axios` calls. They delegate this responsibility to the `orderAPI` object. This makes testing components easier (we can mock `orderAPI`) and keeps the UI code clean.
4.  **Standardized Response Wrapper**: The `ApiResponse<T>` interface suggests an agreement with the backend on a standard envelope for all responses, which simplifies error checking in the UI.

### ⚠️ What is Missing / Needs Improvement

1.  **No Request Interceptors (Auth)**:
    -   *Issue*: There is no mechanism to inject the JWT/Auth token into the headers automatically.
    -   *Risk*: As soon as we add protected routes, we will need to manually pass headers in every function or refactor this file.
    -   *Fix*: Add an `api.interceptors.request.use()` block to read the token from secure storage and attach it to the `Authorization` header.

2.  **Basic Error Handling**:
    -   *Issue*: The `try/catch` block in every function is repetitive (WET code).
    -   *Risk*: If we want to change how errors are processed (e.g., logging to Sentry, or handling 401 Unauthorized globally), we have to edit every function.
    -   *Fix*: Use an `api.interceptors.response.use()` to handle errors globally. If a 401 is received, redirect to login. If a 500 is received, show a toast.

3.  **Hardcoded "Success" Logic**:
    -   *Issue*: The code assumes `response.data` matches `ApiResponse`.
    -   *Risk*: If the backend returns a 200 OK but with a different structure, the app might crash silently or show weird data.

4.  **No Retry Logic**:
    -   *Issue*: Mobile networks are flaky. A simple timeout isn't enough.
    -   *Fix*: Implement a retry mechanism (e.g., `axios-retry`) for idempotent requests like GET.

### 🔮 Future Roadmap & Recommendations

1.  **Adopt React Query (TanStack Query)**:
    -   *Why*: Currently, the UI likely uses `useEffect` + `useState` to fetch data. This leads to boilerplate for loading states, error states, and deduping requests.
    -   *Recommendation*: Keep `api.ts` as the "fetcher" layer, but wrap these calls in React Query hooks (e.g., `useOrders()`). This gives us caching, background refetching, and offline support out of the box.

2.  **Environment Variables**:
    -   Ensure `API_URL` in `constants/config.ts` handles different environments (Dev, Staging, Prod) robustly, perhaps using `react-native-dotenv` or Expo's config.

3.  **Zod Validation**:
    -   *Why*: TypeScript types are erased at runtime. If the API returns a string where a number is expected, the app might crash.
    -   *Recommendation*: Use `zod` to validate the API response at runtime against the expected schema.

## 3. Recommended Flow (The "Go Ahead" Strategy)

**Short Term (Refactor `api.ts`):**
1.  **Add Interceptors**: Implement `request` interceptors for Auth and `response` interceptors for global error handling/logging.
2.  **DRY the Methods**: Create a generic helper function `request<T>(...)` to handle the repetitive `try/catch` logic.

**Medium Term (Architecture Shift):**
1.  **Introduce TanStack Query**: Stop calling `orderAPI` directly in components. Create a `hooks/useOrders.ts` file.
    ```typescript
    export const useOrders = () => {
      return useQuery(['orders'], orderAPI.getPendingOrders);
    };
    ```
2.  **Mocking**: Implement MSW (Mock Service Worker) to intercept these Axios calls during development, allowing frontend work to proceed even if the backend is down.

**Verdict**: The current implementation is a solid **Proof of Concept (PoC)** foundation. It is clean and typed. However, before scaling to more features or production, implementing **Interceptors** and **React Query** is highly recommended to manage state and network complexity effectively.
