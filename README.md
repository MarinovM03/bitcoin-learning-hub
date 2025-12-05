# 🪙 Bitcoin Learning Hub

A Single Page Application (SPA) built with ReactJS for the **SoftUni React Course Exam**. 
This platform serves as an educational hub where users can read articles about Bitcoin, browse a glossary of terms, and contribute their own knowledge.

## 📋 Project Description

**Bitcoin Learning Hub** allows users to browse educational content about cryptocurrency. 
- **Guests** can view the catalog of articles and the glossary.
- **Logged-in users** can create new articles to share knowledge.
- **Authors** have full control (Edit/Delete) over the content they have created.

The application utilizes the **SoftUni Practice Server** for the backend (REST API) and implements client-side rendering with **React Router**.

---

## 🛠️ Technologies Used

* **Library:** ReactJS
* **Routing:** React Router DOM (v6)
* **State Management:** React Context API (Auth Context)
* **API/Data:** SoftUni Practice Server (Custom REST API wrapper)
* **Styling:** CSS
* **Build Tool:** Vite / Create React App

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. The Backend (SoftUni Practice Server)
The application relies on the standalone server provided in the course resources.
1.  Download the **SoftUni Practice Server**.
2.  Open a terminal inside the server folder.
3.  Run the server:
    ```bash
    node server.js
    ```
    *The server should be running on `http://localhost:3030`.*

### 2. The Frontend (This Application)
1.  Clone this repository:
    ```bash
    git clone [https://github.com/MarinovM03/bitcoin-learning-hub.git](https://github.com/MarinovM03/bitcoin-learning-hub.git)
    ```
2.  Navigate to the project directory:
    ```bash
    cd bitcoin-learning-hub
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the application:
    ```bash
    npm run dev
    ```
5.  Open your browser at `http://localhost:3000` (or `5173` if using Vite).

---

## ✨ Features

### Public Area (Guest)
* **Home Page:** Introduction to the hub.
* **Articles Catalog:** Browse a list of all created educational articles.
* **Article Details:** View full details of a specific article.
* **Glossary:** Read-only list of Bitcoin terminology.
* **Authentication:** Login and Register forms.

### Private Area (Logged-in User)
* **Create Article:** Submit new content (Title, Summary, Content, Category, Image).
* **Route Guards:** Protected routes prevent unauthorized access to Create/Edit pages.
* **Logout:** Secure session termination.

### Author Capabilities (Owner)
* **Edit Article:** Update details of articles created by the current user.
* **Delete Article:** Remove articles created by the current user.
* *Note: Edit and Delete buttons are only visible to the article owner.*

---

## 🛣️ Application Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Home Page | Public |
| `/login` | User Login | Guest |
| `/register` | User Registration | Guest |
| `/articles` | Catalog of Articles | Public |
| `/articles/:id` | Article Details | Public |
| `/create-article` | Create a new Article | User |
| `/articles/:id/edit` | Edit Article | Owner |
| `/glossary` | Terminology List | Public |

---
