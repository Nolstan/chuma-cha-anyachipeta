const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const investmentRoutes = require('./routes/investmentRoutes');
const loanRoutes = require('./routes/loanRoutes');
const repaymentRoutes = require('./routes/repaymentRoutes');
const moneyLentRoutes = require('./routes/moneyLentRoutes');
const moneyReceivedRoutes = require('./routes/moneyReceivedRoutes');
const tenantAdvanceRoutes = require('./routes/tenantAdvanceRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const archiveRoutes = require('./routes/archiveRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use('/api/investments', investmentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/money-lent', moneyLentRoutes);
app.use('/api/money-received', moneyReceivedRoutes);
app.use('/api/tenant-advances', tenantAdvanceRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/summary', summaryRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
