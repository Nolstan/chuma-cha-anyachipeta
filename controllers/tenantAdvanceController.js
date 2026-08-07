const TenantAdvance = require('../models/TenantAdvance');

const createTenantAdvance = async (req, res, next) => {
  try {
    const item = await TenantAdvance.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateTenantAdvance = async (req, res, next) => {
  try {
    const item = await TenantAdvance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ error: 'Tenant advance not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteTenantAdvance = async (req, res, next) => {
  try {
    const item = await TenantAdvance.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Tenant advance not found' });
    }
    res.json({ message: 'Tenant advance deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenantAdvance,
  updateTenantAdvance,
  deleteTenantAdvance,
};
