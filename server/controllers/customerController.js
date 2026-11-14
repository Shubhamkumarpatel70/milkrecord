const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const { name, whatsapp, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ message: 'Name and userId are required.' });
    }
    
    const customer = new Customer({ name, whatsapp, user: userId });
    await customer.save();
    
    res.status(201).json({ message: 'Customer added successfully!', customer });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A customer with this WhatsApp number already exists for this user.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    
    const customers = await Customer.find({ user: userId }, 'name whatsapp _id');
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { userId } = req.query;
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // If userId is provided, ensure the customer belongs to that user
    if (userId && customer.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Customer does not belong to this user.' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { name, whatsapp, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanWhatsapp = typeof whatsapp === 'string' ? whatsapp.trim() : '';

    if (!cleanName) {
      return res.status(400).json({ message: 'Customer name is required.' });
    }

    const digits = cleanWhatsapp.replace(/\\D/g, '');
    if (!/^\\+?[0-9\\s()-]+$/.test(cleanWhatsapp) || digits.length < 10 || digits.length > 15) {
      return res.status(400).json({ message: 'Enter a valid mobile number (10–15 digits).' });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: { name: cleanName, whatsapp: cleanWhatsapp } },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found for this user.' });
    }

    return res.json({ message: 'Customer updated successfully.', customer });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A customer with this mobile number already exists.' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid customer ID.' });
    }
    return res.status(500).json({ message: 'Server error.' });
  }
};
