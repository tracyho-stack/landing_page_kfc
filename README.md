# KFC Landing Page

## Project Overview
Build a modern, responsive landing page inspired by KFC for learning purposes.

This is a **frontend-only project** promoting fried chicken products, combo meals, and promotions.

## Technology Stack
Use only:
- HTML5
- CSS3
- Vanilla JavaScript
- CSV files as the product database

Do NOT use:
- Backend code
- Node.js
- PHP
- Python
- SQL / MySQL
- Firebase
- React
- Vue
- Angular
- Next.js
- Any JavaScript framework

Bootstrap or other CSS frameworks should NOT be used unless explicitly requested.

## Project Structure
```text
/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   └── products.csv
└── assets/
    └── images/
```

## Core Requirements
1. Work as a static website.
2. Load product information from `data/products.csv`.
3. Use JavaScript to parse the CSV file.
4. Dynamically render product cards from CSV data.
5. Be responsive on desktop, tablet, and mobile.
6. Use semantic HTML.
7. Keep HTML, CSS, JavaScript, and data separated.
8. Avoid unnecessary dependencies.

## Running the Project
Because JavaScript `fetch()` may not load local CSV files correctly when opening `index.html` directly with `file://`, run the project through a simple local static server.

For example, use the Live Server extension in VS Code or the preview/server function provided by the development environment.

No backend application is required.

## Development Principle
Keep the implementation simple and readable.

Prioritize:
- Clean code
- Clear folder structure
- Reusable CSS
- Small JavaScript functions
- Easy-to-edit CSV data
- Responsive design

Do not over-engineer the project.
