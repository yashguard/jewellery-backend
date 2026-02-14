**ElegantJewels E-commerce Platform**

🛍️ A sophisticated e-commerce platform for jewelry enthusiasts to explore, customize, and purchase exquisite pieces.

---

### Overview

ElegantJewels is a Node.js-based e-commerce project designed to provide a seamless shopping experience for jewelry aficionados. Leveraging MongoDB for database management, it offers a range of modules and functionalities to enhance user engagement and streamline the buying process.

### Modules

1. **User Management**
   - Registration and authentication
   - Customization of products and variants (carat, ring size, diamond quality)
   - Role-based permissions and management

2. **Cart**
   - Management of selected items before checkout

3. **Orders**
   - Handling of purchase orders and order history

4. **Appointment**
   - Booking appointments for consultations or viewings

5. **Billing Address**
   - Management of shipping and billing addresses

6. **Comment**
   - Interaction through comments on products or blog posts

7. **Blog**
   - Publishing and viewing articles related to jewelry trends, care tips, etc.

8. **Payment Integration (Razorpay)**
   - Secure payment processing for seamless transactions

9. **Product Review**
   - Feedback and rating system for purchased products

10. **Video Call**
    - Virtual consultations or demonstrations for customers

11. **Wishlist**
    - Saving favorite items for future reference

### Master Tables Module

Master tables serve as the backbone of the application, storing essential information used across various modules. These tables include:

1. **About Us**: Information about the company, its history, and values.
2. **Banner**: Images and content for promotional banners displayed on the website.
3. **Blog**: Articles related to jewelry trends, care tips, and industry news.
4. **Category**: Categorization of products for easier navigation.
5. **Coupon**: Discount coupons applicable during checkout.
6. **FAQ**: Frequently asked questions and their answers.
7. **Filters**: Criteria for filtering products based on attributes such as price, material, etc.
8. **Inventory**: Stock management for products.
9. **Privacy Policy**: Information regarding user data privacy and terms of service.
10. **Product**: Details of available products, including name, description, and price.
11. **Product Variants**: Different variations of products, such as size, color, etc.
12. **Subcategory**: Subdivisions of product categories for finer organization.

### Role-based Permissions and Management

Within the user management module, roles and permissions are implemented to control access to different features and functionalities. Users can be assigned one or more roles, each with specific permissions. The available roles may include:

- **Admin**: Full access to all features, including user management, content creation, and system settings.
- **Customer Service**: Access to customer-related functionalities such as order management and support.
- **Sales Representative**: Permissions to manage products, and sales-related tasks.
- **Content Editor**: Authority to create, edit, and publish blog articles, FAQs, and other content.

Role permissions can be customized based on the requirements of the organization or business running the platform. Administrators have the ability to assign, modify, and revoke roles and permissions as needed, ensuring efficient management of user access and security.

### Technologies Used

- **Node.js**: Backend development
- **MongoDB**: Database management
- **Razorpay**: Payment integration

### Setup Instructions

1. **Clone the Repository**
   ```
   git clone https://github.com/vishwaVaghasiya16/jewellery-server.git
   ```

2. **Install Dependencies**
   ```
   cd ElegantJewels
   npm install
   ```

3. **Set Environment Variables**
   - Create a `.env` file based on the `.env.dev` template.
   - Configure MongoDB connection URI and Razorpay API keys.

4. **Run the Application**
   ```
   npm run dev
   ```

5. **Access the Application**
   - Open your web browser and go to `http://localhost:8000`

---

Feel free to explore and contribute to ElegantJewels to make it even more dazzling for our users! ✨
