# Functional Requirements

## 1. Header / Navigation
Create a sticky navigation bar containing:
- KFC-style brand/logo area
- Home
- Menu
- Promotions
- About
- Order Now button

On mobile, convert the navigation into a hamburger menu.

## 2. Hero Section
Create a strong promotional hero section for fried chicken.

Include:
- Large headline
- Short promotional description
- Primary CTA: "Order Now"
- Secondary CTA: "View Menu"
- Large fried chicken / combo meal visual

Example messaging:
> Crispy. Juicy. Finger Lickin' Good.

The hero should immediately communicate that the website is promoting fried chicken and combo meals.

## 3. Featured Menu
Create a section titled **Our Favorites**.

Products must NOT be hard-coded individually in HTML.

JavaScript must load product information from `data/products.csv`.

Each card should contain:
- Product image
- Product name
- Short description
- Price
- Optional original price
- Category
- Order button

Featured products should be determined by the `featured` field in the CSV file.

## 4. Menu Categories
Provide category filters:
- All
- Fried Chicken
- Burgers
- Combos
- Sides
- Drinks

When users click a category, JavaScript should filter the displayed products without reloading the page.

## 5. Promotion Section
Create a visually prominent promotional banner.

Example:
### Bucket Deals
Enjoy more chicken with family and friends.

Include:
- Promotional image
- Short description
- CTA button

## 6. Why Choose Us
Create three benefit cards:
- **Freshly Prepared** — Chicken prepared fresh for every order.
- **Signature Flavor** — Crispy coating and signature seasoning.
- **Perfect for Sharing** — Buckets and combos designed for families and groups.

## 7. Product Interaction
When users click an "Order Now" button:
- Show a simple modal or notification.
- Display the selected product name.
- Allow the user to choose quantity.
- Calculate the total price.

This is a demo landing page.

Do NOT implement:
- Real checkout
- Payment gateway
- User accounts
- Order database
- Authentication
- Backend API

## 8. Footer
Footer should contain:
- Brand/logo
- Navigation links
- Contact information
- Social media placeholders
- Copyright notice

# Responsive Requirements
The website must work correctly at:
- Desktop: 1200px+
- Laptop: 992px+
- Tablet: 768px+
- Mobile: below 768px

Important elements must remain readable and usable on small screens.

# JavaScript Requirements
Use Vanilla JavaScript only.

JavaScript responsibilities:
1. Fetch `data/products.csv`
2. Parse CSV data
3. Convert rows into product objects
4. Render product cards
5. Filter products by category
6. Handle mobile navigation
7. Handle product modal
8. Calculate quantity × price

Keep functions small and clearly named.
Avoid global variables when possible.

# Error Handling
If the CSV file cannot be loaded, display:

> Menu is temporarily unavailable. Please try again later.

Do not leave the product section empty without explanation.
