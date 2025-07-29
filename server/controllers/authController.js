const User = require('../models/User');
const Customer = require('../models/Customer');
const QRCode = require('qrcode');

exports.register = async (req, res) => {
  try {
    const { name, mobile, mpin } = req.body;
    if (!name || !mobile || !mpin) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    
    // Store MPIN in plain text (no hashing)
    const user = new User({ name, mobile, mpin });
    await user.save();
    
    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile, mpin } = req.body;
    console.log('Login attempt:', { mobile, mpin });
    
    if (!mobile || !mpin) {
      console.log('Missing mobile or mpin');
      return res.status(400).json({ message: 'Mobile and MPIN are required.' });
    }
    
    const user = await User.findOne({ mobile });
    console.log('User found:', user ? { name: user.name, mobile: user.mobile, mpin: user.mpin } : 'No user found');
    
    if (!user) {
      console.log('No user found with mobile:', mobile);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    // Direct comparison for plain text MPIN
    const isMatch = mpin === user.mpin;
    console.log('MPIN comparison:', { provided: mpin, stored: user.mpin, isMatch });
    
    if (!isMatch) {
      console.log('MPIN does not match');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    // Check if user is active
    if (user.isActive === false) {
      console.log('Login failed - user is disabled:', user.name);
      return res.status(400).json({ message: 'Account is disabled. Please contact administrator.' });
    }

    console.log('Login successful for user:', user.name, 'Role:', user.role || 'user');
    res.json({
      message: 'Login successful!',
      userId: user._id,
      userRole: user.role || 'user',
      userName: user.name
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.customerLogin = async (req, res) => {
  try {
    const { whatsapp } = req.body;
    console.log('Customer login attempt with WhatsApp:', whatsapp);
    
    if (!whatsapp) {
      return res.status(400).json({ message: 'WhatsApp number is required.' });
    }
    
    // Find customer by WhatsApp number (search across all users)
    const customer = await Customer.findOne({ whatsapp: whatsapp });
    console.log('Customer found:', customer ? { name: customer.name, whatsapp: customer.whatsapp, userId: customer.user } : 'No customer found');
    
    if (!customer) {
      console.log('No customer found with WhatsApp:', whatsapp);
      return res.status(400).json({ message: 'Customer not found.' });
    }
    
    res.json({
      success: true,
      message: 'Login successful!',
      customer: {
        _id: customer._id,
        name: customer.name,
        whatsapp: customer.whatsapp,
        userId: customer.user // Include the user ID for milk record queries
      }
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add payment option
exports.addPaymentOption = async (req, res) => {
  try {
    const { userId, upiId } = req.body;
    
    if (!userId || !upiId) {
      return res.status(400).json({ message: 'User ID and UPI ID are required.' });
    }
    
    // Validate UPI ID format (basic validation)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: 'Please enter a valid UPI ID (e.g., username@bank).' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    user.paymentOptions.upiId = upiId;
    user.paymentOptions.hasPaymentOption = true;
    await user.save();
    
    res.json({ 
      message: 'Payment option added successfully!',
      paymentOptions: user.paymentOptions
    });
  } catch (err) {
    console.error('Add payment option error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get payment option
exports.getPaymentOption = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ 
      paymentOptions: user.paymentOptions
    });
  } catch (err) {
    console.error('Get payment option error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Generate QR code for payment
exports.generatePaymentQR = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    if (!user.paymentOptions.hasPaymentOption || !user.paymentOptions.upiId) {
      return res.status(400).json({ message: 'Payment option not configured.' });
    }
    
    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${user.paymentOptions.upiId}&pn=${encodeURIComponent(user.name)}&am=${amount}&cu=INR&tn=Milk Payment`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({ 
      upiUrl: upiUrl,
      qrCodeDataUrl: qrCodeDataUrl,
      upiId: user.paymentOptions.upiId,
      userName: user.name,
      amount: amount
    });
  } catch (err) {
    console.error('Generate payment QR error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 