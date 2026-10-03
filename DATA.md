# Data Specification

## Data Source
All product information must be stored in:

`data/products.csv`

The HTML file must NOT contain hard-coded product data.

JavaScript should load the CSV using `fetch()`.

# CSV Structure
Use the following columns:

```csv
id,name,category,description,price,original_price,image,featured
```

## Field Definitions

### id
Unique product identifier.

Example: `P001`

### name
Product display name.

Example: `Original Fried Chicken`

### category
Allowed values:
- Fried Chicken
- Burger
- Combo
- Sides
- Drinks

### description
Short product description.

### price
Current selling price as a number without currency symbols.

Example: `89000`

### original_price
Optional original price before discount.

Example: `109000`

Leave empty if the product is not discounted.

### image
Local image path.

Example: `assets/images/original-chicken.jpg`

### featured
Allowed values: `true` or `false`.

# Example CSV
```csv
id,name,category,description,price,original_price,image,featured
P001,Original Fried Chicken,Fried Chicken,Crispy signature fried chicken,45000,,assets/images/original-chicken.jpg,true
P002,Hot & Spicy Chicken,Fried Chicken,Spicy crispy fried chicken,49000,,assets/images/spicy-chicken.jpg,true
P003,Zinger Burger,Burger,Crispy chicken burger with spicy sauce,69000,79000,assets/images/zinger-burger.jpg,true
P004,Family Bucket,Combo,Fried chicken bucket perfect for sharing,249000,289000,assets/images/family-bucket.jpg,true
P005,French Fries,Sides,Golden crispy french fries,35000,,assets/images/fries.jpg,false
P006,Pepsi,Drinks,Refreshing soft drink,25000,,assets/images/pepsi.jpg,false
```

# JavaScript Data Model
After parsing the CSV, convert each row into an object similar to:

```javascript
{
    id: "P001",
    name: "Original Fried Chicken",
    category: "Fried Chicken",
    description: "Crispy signature fried chicken",
    price: 45000,
    originalPrice: null,
    image: "assets/images/original-chicken.jpg",
    featured: true
}
```

Convert numeric fields into numbers.
Convert the `featured` field into a Boolean.

# CSV Parsing
Keep CSV parsing logic inside JavaScript.

Do not introduce a database library or backend server.

If descriptions or other fields may contain commas, the parser must correctly handle quoted CSV fields.

Example:

```csv
P007,Sharing Combo,Combo,"Chicken, fries and drinks for sharing",199000,,assets/images/combo.jpg,true
```

# Currency
Display prices in Vietnamese Dong.

Example: `249000` should render as `249.000 ₫`.

Use JavaScript internationalization when possible:

```javascript
new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
})
```

# Important Limitation
The CSV file acts only as a static data source.

JavaScript running in the browser may READ the CSV file but should not be expected to permanently WRITE changes back to `products.csv`.

Therefore:
- Product data can be read from CSV.
- Products can be filtered in the browser.
- Cart data can temporarily exist in JavaScript.
- LocalStorage may be used for temporary client-side persistence.
- Permanent product editing is outside the scope of this project.

Do not implement backend functionality.
