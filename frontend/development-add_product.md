# Add Product Feature — Developer Flow

This document explains the end-to-end flow and key functions for the **Admin Add Product** feature in NutriLens.

---

## Data Structure the Admin Submits

```
{
  imgUrl      : <uploaded image file>   // single File, sent as multipart
  name        : string
  brand       : string
  barcode     : string

  // ── NOT submitted by admin (computed by backend) ──
  processingLevel : null   // derived from additives/NOVA score by controller
  rating          : null   // computed by the addProduct controller

  nutrients: {
    energy_kcal   : "value",
    sugar         : "value",
    fat           : "value",
    saturated_fat : "value",
    sodium        : "value",
    carbohydrates : "value",
    protein       : "value",
    // ...admin can add custom keys too
  },

  additives: ["E330", "E471", ...]   // admin types only the code; full additive
                                     // data is fetched from DB by the controller
}
```

---

## File Map

| File | Role |
|---|---|
| `src/features/product/pages/AdminPage.jsx` | UI — `ProductModal` component |
| `src/features/product/styles/admin.scss` | Styles for modal, image upload zone, kv-rows |
| `src/features/product/hooks/useAdminHook.jsx` | `handleAddProduct` — calls the API, updates products state |
| `src/features/product/services/admin.api.js` | `addProduct()` — fires `POST /api/admin/products` |
| `backend/controllers/adminController.js` | `addProduct` controller — fills in `processingLevel`, `rating`, expands additive codes |

---

## Frontend Flow

### 1. Admin Opens the Modal
Clicking **Add Product** (header button or section button) calls `setProductModal("add")`.

```jsx
// AdminPage.jsx
{productModal && (
  <ProductModal
    product={productModal === "add" ? null : productModal}
    onClose={() => setProductModal(null)}
    onSave={productModal === "add" ? handleAddProduct : handleUpdateProduct}
  />
)}
```

`onSave` is wired to `handleAddProduct` when adding.

---

### 2. `ProductModal` — State & Helpers

```jsx
const [name, setName]           = useState("");
const [brand, setBrand]         = useState("");
const [barcode, setBarcode]     = useState("");
const [imageFile, setImageFile] = useState(null);      // File object
const [imagePreview, ...]       = useState(null);       // Object URL for <img>

// Nutrients: array of { key, value }  — pre-populated with 7 default keys
const [nutrients, setNutrients] = useState(DEFAULT_NUTRIENTS);

// Additives: array of { code }  — starts empty
const [additives, setAdditives] = useState([]);
```

**Default nutrients** are defined in the `DEFAULT_NUTRIENTS` constant so the
form always starts with the standard 7 fields but the admin can add/remove freely.

---

### 3. Image Upload

```jsx
// Hidden <input type="file"> is triggered by clicking the styled upload zone
const fileInputRef = useRef(null);

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file)); // local preview
};
```

Only **one** image is accepted (`accept="image/*"`).  
The File object is later appended to FormData as `fd.append("image", imageFile)`.

---

### 4. Nutrients — Dynamic Key-Value Pairs

```jsx
// Change a specific row's key or value
const handleNutrientChange = (index, field, val) => { ... };

// Add a new blank row
const addNutrientRow = () => setNutrients(prev => [...prev, { key: "", value: "" }]);

// Remove a row
const removeNutrientRow = (index) => setNutrients(prev => prev.filter((_, i) => i !== index));
```

Each row renders:  
`[ key input ] : [ value input ] [ − remove button ]`

The **"Add Field"** button appends a blank row, letting the admin enter any custom nutrient key.

---

### 5. Additives — Code-Only Array

```jsx
const addAdditiveRow    = () => setAdditives(prev => [...prev, { code: "" }]);
const removeAdditiveRow = (index) => { ... };
const handleAdditiveChange = (index, val) => { ... };
```

The admin types only the **additive code** (e.g. `E330`).  
The backend controller looks up the full additive object from the database and replaces
the codes with enriched `{ code, name, description, risk }` objects before saving.

---

### 6. `handleSubmit` — Builds FormData

```jsx
const handleSubmit = (e) => {
  e.preventDefault();

  // Convert nutrients array → plain object
  const nutrientsObj = {};
  nutrients.forEach(({ key, value }) => {
    if (key.trim()) nutrientsObj[key.trim()] = value.trim();
  });

  // Additives: only the code strings
  const additivesCodes = additives.map(a => a.code.trim()).filter(Boolean);

  const fd = new FormData();
  fd.append("name",      name.trim());
  fd.append("brand",     brand.trim());
  fd.append("barcode",   barcode.trim());
  fd.append("nutrients", JSON.stringify(nutrientsObj));  // JSON string
  fd.append("additives", JSON.stringify(additivesCodes)); // JSON string
  if (imageFile) fd.append("image", imageFile);          // binary

  onSave(fd);   // calls handleAddProduct(fd)
  onClose();
};
```

> **Why FormData?**  
> `Content-Type: multipart/form-data` is required to upload a binary file alongside
> text fields in a single request. JSON cannot carry binary data natively.

---

### 7. `handleAddProduct` (Hook)

```jsx
// useAdminHook.jsx
const handleAddProduct = async (productData) => {
  setLoading(true);
  try {
    const data = await addProduct(productData); // productData is FormData
    setProducts(prev => [data.product, ...prev]);
  } catch (err) {
    console.log(err?.response?.data?.message || "Failed to add product");
  } finally {
    setLoading(false);
  }
};
```

On success, the returned `product` document from the backend (fully enriched) is
**prepended** to the local products list so the UI updates instantly.

---

### 8. `addProduct` (API Service)

```js
// admin.api.js
export async function addProduct(productData) {
  const isFormData = productData instanceof FormData;
  const response = await api.post('/products', productData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
}
```

Detects `FormData` and sets the correct header so Axios includes the multipart boundary.

---

## Backend Responsibilities (Controller Side)

The `addProduct` controller at `POST /api/admin/products` is expected to:

1. **Parse `nutrients`** from `req.body.nutrients` — it arrives as a JSON string, so `JSON.parse(req.body.nutrients)`.
2. **Parse `additives`** from `req.body.additives` — also a JSON string array of codes (`["E330", "E471"]`). The controller fetches each code from the `Additive` collection and replaces the code array with full objects.
3. **Upload the image** — if using Cloudinary/Multer, the file is in `req.file`. The controller uploads it and stores the resulting URL as `imgUrl`.
4. **Set `rating: null`** — computed later (or immediately) based on nutrients/additives score logic.
5. **Set `processingLevel`** — derived from NOVA classification logic based on the resolved additives.

---

## What the Admin Does NOT Control

| Field | Who sets it |
|---|---|
| `processingLevel` | Backend controller (NOVA classification) |
| `rating` | Backend controller (NutriScore / custom formula) |
| Full additive data (`name`, `description`, `risk`) | Backend controller (DB lookup) |
| `imgUrl` | Backend controller (cloud upload returns URL) |

---

## UI Elements Quick Reference

| Element ID | Purpose |
|---|---|
| `admin-add-product-btn` | Opens ProductModal in "add" mode (header) |
| `pf-image` | Hidden file input for image upload |
| `pf-name`, `pf-brand`, `pf-barcode` | Basic text fields |
| `add-nutrient-row-btn` | Appends a new blank nutrient key-value row |
| `nutrient-key-{i}` / `nutrient-val-{i}` | Each nutrient row's key and value inputs |
| `add-additive-row-btn` | Appends a new additive code input |
| `additive-code-{i}` | Each additive code input |
