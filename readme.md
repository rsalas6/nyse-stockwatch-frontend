# NYSE StockWatch Frontend

The `nyse-stockwatch-frontend` is a Vue.js application developed as part of a technical assessment by **Roberto Salas**. This application interacts with a backend API built using Django REST framework, providing users with the ability to manage companies, validate stock symbols via external APIs, and view real-time stock market data. 

## Features

- **Add and manage companies**: Users can add, edit, and delete companies, with stock symbols validated through the Alpha Vantage API.
- **Real-time stock data**: View the latest market trends and stock performance data for individual companies.
- **Filter and search**: Search companies by name, symbol, or description, and sort them in ascending or descending order.
- **Data visualization**: Display stock market performance over the last 7 days using Chart.js.
- **Pagination**: Efficient pagination for displaying companies.
- **Token Authentication**: Users are required to provide a valid API token to interact with the backend, which is stored securely in local storage.
- **Responsive Design**: Fully responsive design suitable for both mobile and desktop devices.

## Prerequisites

To run this project, make sure you have **Node.js**, **npm**, and **Vue CLI** installed.

### Required Environment Variables

Create a `.env` file in the root directory with the following variable to configure the backend API:

```plaintext
VITE_API_URL=http://localhost:8000
```

## Getting Started

### Project Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/rsalas6/nyse-stockwatch-frontend.git
    cd nyse-stockwatch-frontend
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Run the development server**:

    ```bash
    npm run dev
    ```

   The application will be available at **http://localhost:3000**.

### Token Authentication

When the application is launched for the first time or when there is no valid API token stored in local storage, users are prompted to enter their API token. The token is validated against the backend API and stored securely for future use.

### Managing Companies

- **Add a Company**: Users can add new companies by entering a valid stock symbol. The symbol is validated against the Alpha Vantage API.
- **Edit/Delete Companies**: Companies can be updated or deleted, with changes reflected in real time.
- **View Market Data**: For each company, users can view a line chart displaying the stock’s performance over the last 7 days, including opening and closing prices.

### Filter, Search, and Sort Companies

- **Search**: Users can search for companies by name, symbol, or description.
- **Sort**: Companies can be sorted alphabetically by name or symbol in ascending or descending order.
- **Pagination**: Allows for browsing large sets of data efficiently, with controls to adjust the number of items displayed per page.

### Error Handling and Feedback

The application uses toast notifications to provide feedback for actions such as adding or deleting companies. Errors such as invalid API tokens or failed external validations are handled and displayed to users through toast notifications.

## Building the Project

To build the project for production:

```bash
npm run build
```

The build files will be output to the `dist/` folder.

## TODO: Testing

The frontend includes unit tests to ensure the application functions correctly. To run the tests, use the following command:

```bash
npm run test
```

The testing suite is built using **Vue Test Utils** and **Jest**, ensuring that the components render and behave as expected.

### Available Test Scripts:

- **Run Unit Tests**:

    ```bash
    npm run test:unit
    ```

- **Run All Tests**:

    ```bash
    npm run test
    ```

- **Run Tests in Watch Mode**:

    ```bash
    npm run test:watch
    ```

## Code Formatting and Linting

The project is configured with **ESLint** and **Prettier** for code quality and consistency. 

- **Check for linting issues**:

    ```bash
    npm run lint
    ```

- **Automatically fix linting issues**:

    ```bash
    npm run lint --fix
    ```

## Folder Structure

- **src/**: Contains the core application source code.
  - **assets/**: Contains static resources such as images and stylesheets.
  - **components/**: Reusable Vue.js components for the application.
  - **router/**: Vue Router configuration for handling routes in the application.
  - **store/**: Vuex store configuration for state management (if applicable).
  - **views/**: Main view files for each route (e.g., Home, About, CompanyDetail).
  - **api.js**: Axios configuration for interacting with the backend API.

## Deployment

The application is ready to be deployed to any static hosting provider such as **Netlify**, **Vercel**, or **GitHub Pages**. Simply run `npm run build` and upload the contents of the `dist` folder to your hosting provider.