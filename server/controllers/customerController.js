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