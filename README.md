# 🥛 Milk Record Management System

A comprehensive web application for managing milk production records, customer data, and business analytics. Built with React.js frontend and Node.js backend with MongoDB database.

## ✨ Features

### 🎨 **User Interface**

- **Dark/Light Theme Toggle** - Switch between light and dark themes
- **Multi-language Support** - English and Hindi language options
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Progressive Web App (PWA)** - Install as a native app on your device

### 🔐 **Authentication & Security**

- **Mobile + MPIN Login** - Secure authentication system
- **Customer Portal** - Separate login for customers to view their records
- **Admin Dashboard** - Complete administrative control
- **User Isolation** - Each user can only access their own data

### 📊 **Business Management**

- **Customer Management** - Add, edit, and manage customer information
- **Daily Milk Records** - Track daily milk production and payments
- **Payment Tracking** - Monitor paid and pending amounts
- **Analytics Dashboard** - View business performance metrics
- **QR Code Payments** - Generate payment QR codes for customers

### 📱 **Customer Features**

- **Record Viewing** - Customers can view their milk records
- **Payment Status** - Check payment history and pending amounts
- **Calendar View** - Monthly calendar with daily records
- **Payment QR Codes** - Easy payment through QR codes

## 🚀 Technology Stack

### Frontend

- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **PWA Features** - Service workers and app manifest

### Backend

- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Additional Features

- **JWT Authentication** - Secure token-based authentication
- **File Upload** - Image and file handling
- **QR Code Generation** - Payment QR codes
- **WhatsApp Integration** - Customer communication

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Shubhamkumarpatel70/milkrecord.git
cd milkrecord
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
cd server
npm install
```

#### Frontend Dependencies

```bash
cd client
npm install
```

### 3. Environment Configuration

Create `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/milkrecord
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
NODE_ENV=development
```

#**Important:** Set `JWT_SECRET` in the Render backend environment variables to a random secret of at least 32 characters. Do not commit the real secret to Git. Login and registration issue 7-day signed sessions; owner APIs require a valid session and admin APIs additionally require the `admin` role. Existing users must sign in again after this update. The customer-facing WhatsApp-only access flow is not considered secure and must not be enabled for real customer records until OTP verification is integrated.

## 4. Start the Application

#### Start Backend Server

```bash
cd server
npm start
```

#### Start Frontend Development Server

```bash
cd client
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Project Structure

```
milkrecord/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── translations/  # Language files
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── scripts/          # Utility scripts
│   └── server.js         # Main server file
└── README.md
```

## 🎯 Key Features Explained

### Settings System

- **Theme Toggle**: Switch between light and dark themes
- **Language Switch**: Toggle between English and Hindi
- **Persistent Settings**: Preferences saved in localStorage
- **Universal Access**: Settings button available on all pages

### Dashboard Analytics

- **Today's Milk**: Current day's total milk production
- **Total Revenue**: Complete business revenue tracking
- **Customer Count**: Total number of customers
- **Payment Status**: Paid vs pending amounts

### Customer Management

- **Add Customers**: Simple customer registration
- **Edit Information**: Update customer details
- **View Records**: Complete customer history
- **Share Records**: Generate shareable customer links

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/customer-login` - Customer login

### Milk Records

- `GET /api/milk-records` - Get all records
- `POST /api/milk-records` - Add new record
- `PUT /api/milk-records/:id` - Update record
- `DELETE /api/milk-records/:id` - Delete record

### Customers

- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Admin (Admin only)

- `GET /api/admin/users` - Get all users
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/milk-records` - Get all records

## 🎨 UI/UX Features

### Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Perfect layout for tablets
- **Desktop Experience**: Enhanced features for larger screens

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Compatible with assistive technologies
- **High Contrast**: Dark theme for better visibility
- **Font Scaling**: Responsive text sizing

### PWA Features

- **Offline Support**: Basic offline functionality
- **App Installation**: Install as native app
- **Push Notifications**: Real-time updates
- **Background Sync**: Data synchronization

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
cd client
npm run build
```

### Backend Deployment (Heroku/Railway)

```bash
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shubham Kumar Patel**

- GitHub: [@Shubhamkumarpatel70](https://github.com/Shubhamkumarpatel70)
- Project: [Milk Record](https://github.com/Shubhamkumarpatel70/milkrecord)

## 🙏 Acknowledgments

- React.js community for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB for the flexible database solution
- All contributors and users of this project

---

⭐ **Star this repository if you find it helpful!**
# Build fix update
