# Quick Coupon Generation Feature

## Overview
This feature allows admins to generate coupons for products with a single click in the Manage Products section. The generated coupon uses the product's discount percentage (or defaults to 10% if no discount is set).

## How it Works

### Admin Side (Manage Products)
1. Navigate to Admin → Manage Products
2. Each product row now has two coupon buttons:
   - **Quick Coupon Button**: Green button showing the discount percentage (e.g., "🎫 15% Coupon")
   - **Custom Coupon Button**: Tag icon for detailed coupon settings

### Quick Coupon Generation
- **Single Click**: Just click the "Quick Coupon" button
- **Auto Discount**: Uses the product's discount percentage from the product settings
- **Default Discount**: If no discount is set on the product, defaults to 10%
- **Auto Settings**: 
  - Valid for 1 month from creation
  - Usage limit: 100 times
  - Product-specific coupon
  - No minimum purchase required

### Generated Coupon Details
- **Code**: Random 8-character alphanumeric code (e.g., "ABC123XY")
- **Type**: Percentage discount
- **Validity**: 1 month from generation date
- **Usage**: Limited to 100 uses
- **Scope**: Only applicable to the specific product

## User Experience

### Product Detail Page
- Generated coupons automatically appear in the "Available Offers" section
- Users can copy coupon codes with one click
- Shows discount percentage and description

### Checkout Page
- Coupons appear in the "Available offers for your cart" section
- Users can apply coupons with one click
- Shows real-time discount calculation
- Displays savings amount

## API Endpoints

### Quick Coupon Generation
```
POST /api/coupons/generate/:productId
```
- **Access**: Admin only
- **Purpose**: Generate quick coupon using product's discount percentage
- **Response**: Returns generated coupon with success message

### Existing Coupon Endpoints
- `GET /api/coupons/product/:productId` - Get coupons for a product
- `POST /api/coupons/validate` - Validate coupon with cart items
- `POST /api/coupons/apply` - Apply coupon and increment usage

## Benefits

1. **Speed**: Generate coupons instantly without filling forms
2. **Consistency**: Uses product's existing discount percentage
3. **Automatic**: No need to set dates, codes, or complex rules
4. **User-Friendly**: Coupons appear automatically on product pages
5. **Flexible**: Still allows custom coupon creation for advanced needs

## Usage Flow

1. **Admin**: Sets product discount percentage when adding/editing product
2. **Admin**: Clicks "Quick Coupon" button in Manage Products
3. **System**: Generates coupon with product's discount percentage
4. **User**: Sees coupon on product detail page
5. **User**: Applies coupon during checkout
6. **System**: Applies discount and shows savings

This feature streamlines the coupon creation process while maintaining all the flexibility of the existing coupon system.