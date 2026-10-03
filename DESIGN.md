# Design Guidelines

## Design Direction
Create a bold, modern fast-food landing page inspired by the visual identity of KFC.

The page should feel:
- Energetic
- Appetizing
- Modern
- Friendly
- Bold
- Easy to navigate

Avoid making the interface overly complex.

# Color Palette

## Primary Red
`#E4002B`

Use for CTA buttons, promotional areas, important highlights, and active navigation states.

## Dark
`#1F1F1F`

Use for main text, dark sections, and footer.

## White
`#FFFFFF`

Use as the main background.

## Light Background
`#F7F3EF`

Use for alternating sections and product areas.

# Typography
Use a bold sans-serif style.

Preferred fonts:
- Arial
- Helvetica
- system-ui
- sans-serif

Do not require external font libraries.

Headlines should be large, bold, short, and high contrast.
Body text should prioritize readability.

# Layout
Use a centered content container.

Recommended maximum width: `1200px`

Standard section spacing:
- Desktop: `80px - 100px`
- Mobile: `48px - 64px`

# Hero Design
Desktop layout:

```text
---------------------------------------------
|                                           |
|   HEADLINE              PRODUCT IMAGE     |
|                                           |
|   Description           Fried Chicken     |
|                                           |
|   [ORDER NOW]           / Combo Bucket    |
|   [VIEW MENU]                             |
|                                           |
---------------------------------------------
```

Hero should occupy a large portion of the first viewport.
The food image should be visually dominant.

# Product Cards
Use a clean card design.

```text
+----------------------+
|                      |
|    Product Image     |
|                      |
+----------------------+
| Category             |
| Product Name         |
| Description          |
|                      |
| Price                |
|                      |
|     [ORDER NOW]      |
+----------------------+
```

Cards should have:
- Rounded corners
- Subtle shadow
- Consistent image ratio
- Clear price hierarchy
- Hover animation

On hover:
- Slightly move the card upward
- Increase shadow subtly

Avoid excessive animation.

# Buttons
Primary button:
- Red background
- White text
- Bold label
- Rounded corners

Secondary button:
- Transparent or white background
- Dark/red border

Buttons must have hover, focus, and active states.

# Mobile Design
On mobile:
- Hero becomes one column.
- Text appears before the image.
- Product grid becomes one or two columns depending on screen width.
- Navigation collapses into hamburger menu.
- Buttons remain large enough for touch interaction.
- Avoid horizontal scrolling.

# Accessibility
Use:
- Semantic HTML elements
- Alt text for images
- Visible focus states
- Sufficient color contrast
- Proper button elements for actions

Do not use `<div>` elements as clickable buttons.

# Image Guidelines
Use high-quality food photography.

Preferred images:
- Fried chicken
- Chicken bucket
- Burger
- French fries
- Combo meals
- Soft drinks

Images should have consistent aspect ratios.

Use local image paths under `assets/images/`.

Do not use random image URLs directly inside the final HTML unless specifically requested.
