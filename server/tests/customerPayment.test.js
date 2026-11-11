const test = require('node:test');
const assert = require('node:assert/strict');

const Customer = require('../models/Customer');
const MilkRecord = require('../models/MilkRecord');
const controller = require('../controllers/milkRecordController');

const originals = {
  customerFindOne: Customer.findOne,
  customerFind: Customer.find,
  milkFind: MilkRecord.find
};

let customer;
let records;
let customerQuery;
let milkQuery;
let customerSaveCalls;
let recordSaveCalls;

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

function makeRecord(amount, paidAmount = 0) {
  return {
    amount,
    paidAmount,
    status: paidAmount >= amount ? 'paid' : 'unpaid',
    async save() { recordSaveCalls += 1; }
  };
}

test.beforeEach(() => {
  customerSaveCalls = 0;
  recordSaveCalls = 0;
  customerQuery = null;
  milkQuery = null;
  customer = {
    _id: 'customer-1',
    name: 'Ayush',
    paymentTransactions: [],
    async save() { customerSaveCalls += 1; }
  };
  records = [makeRecord(100)];

  Customer.findOne = async query => {
    customerQuery = query;
    return customer;
  };
  Customer.find = () => ({
    select: async () => [{ _id: customer._id }]
  });
  MilkRecord.find = query => {
    milkQuery = query;
    return { sort: async () => records };
  };
});

test.afterEach(() => {
  Customer.findOne = originals.customerFindOne;
  Customer.find = originals.customerFind;
  MilkRecord.find = originals.milkFind;
});

async function callPayment(body = {}) {
  const res = response();
  await controller.customerPayment({
    authUser: { _id: 'owner-1' },
    body: { customerId: 'customer-1', month: '2026-11', amount: 40, paymentDate: '2026-11-10', ...body }
  }, res);
  return res;
}

test('records a partial payment, updates milk dues, and stores date plus remark', async () => {
  const res = await callPayment({ amount: 40, remark: 'Cash partial payment' });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.totalPaid, 40);
  assert.equal(res.body.remainingAmount, 60);
  assert.equal(records[0].paidAmount, 40);
  assert.equal(records[0].status, 'unpaid');
  assert.equal(customer.paymentTransactions.length, 1);
  assert.equal(customer.paymentTransactions[0].amount, 40);
  assert.equal(customer.paymentTransactions[0].remark, 'Cash partial payment');
  assert.equal(new Date(customer.paymentTransactions[0].paymentDate).toISOString().slice(0, 10), '2026-11-10');
  assert.equal(customerSaveCalls, 1);
  assert.equal(recordSaveCalls, 1);
  assert.equal(milkQuery.user, 'owner-1');
  assert.equal(customerQuery.user, 'owner-1');
});

test('allocates a payment across multiple milk records in date order', async () => {
  records = [makeRecord(100), makeRecord(100)];
  const res = await callPayment({ amount: 150, remark: '' });

  assert.equal(res.statusCode, 200);
  assert.equal(records[0].paidAmount, 100);
  assert.equal(records[0].status, 'paid');
  assert.equal(records[1].paidAmount, 50);
  assert.equal(records[1].status, 'unpaid');
  assert.equal(res.body.remainingAmount, 50);
  assert.equal(customer.paymentTransactions[0].remark, '');
});

test('rejects a payment larger than the remaining balance without writing', async () => {
  const res = await callPayment({ amount: 101 });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.remainingAmount, 100);
  assert.equal(recordSaveCalls, 0);
  assert.equal(customerSaveCalls, 0);
  assert.equal(customer.paymentTransactions.length, 0);
});

test('rejects malformed or impossible payment dates', async () => {
  const res = await callPayment({ paymentDate: '2026-02-30' });

  assert.equal(res.statusCode, 400);
  assert.equal(recordSaveCalls, 0);
  assert.equal(customerSaveCalls, 0);
});

test('rejects an invalid amount and overlong remark', async () => {
  const badAmount = await callPayment({ amount: 0 });
  assert.equal(badAmount.statusCode, 400);

  const longRemark = await callPayment({ amount: 10, remark: 'x'.repeat(501) });
  assert.equal(longRemark.statusCode, 400);
  assert.equal(recordSaveCalls, 0);
  assert.equal(customerSaveCalls, 0);
});

test('returns not found when the selected customer has no milk records for that month', async () => {
  records = [];
  const res = await callPayment();

  assert.equal(res.statusCode, 404);
  assert.equal(customerSaveCalls, 0);
  assert.equal(recordSaveCalls, 0);
});
