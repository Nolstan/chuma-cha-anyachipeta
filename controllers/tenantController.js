const Tenant = require('../models/Tenant');

const createTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.create(req.body);
    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
};

const getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({ archived: { $ne: true } });
    res.json(tenants);
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    next(error);
  }
};

const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenant,
  getTenants,
  updateTenant,
  deleteTenant,
};
