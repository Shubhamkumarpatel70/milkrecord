import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CustomerManagementPage from './CustomerManagementPage';

const customer = {
  _id: 'customer-1',
  name: 'Ayush',
  whatsapp: '9876543210',
  totalDays: 2,
  totalAmount: 210,
  paidAmount: 70,
  status: 'unpaid',
  paymentTransactions: [
    { _id: 'tx-2', amount: 30, paymentDate: '2026-11-12T12:00:00.000Z', remark: 'Cash' },
    { _id: 'tx-1', amount: 40, paymentDate: '2026-11-11T12:00:00.000Z', remark: 'Partial payment' }
  ]
};

describe('CustomerManagementPage', () => {
  test('shows customer-specific milk quantity and transaction count', () => {
    render(
      <CustomerManagementPage
        customers={[customer]}
        records={[
          { customer: 'Ayush', quantityKg: 2, quantityUnit: 'kg' },
          { customer: 'Other', quantityKg: 9, quantityUnit: 'kg' },
          { customer: 'Ayush', quantityKg: 1, quantityUnit: 'liter' }
        ]}
      />
    );
    expect(screen.getByText('2 Kg + 1 L')).toBeInTheDocument();
    expect(screen.getByText('Show Transactions (2)')).toBeInTheDocument();
  });

  test('opens a date-wise transaction history with DD-MM-YYYY and remarks', () => {
    render(<CustomerManagementPage customers={[customer]} records={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Transactions (2)' }));
    expect(screen.getByRole('heading', { name: 'Payment Transactions' })).toBeInTheDocument();
    expect(screen.getByText('12-11-2026')).toBeInTheDocument();
    expect(screen.getByText('11-11-2026')).toBeInTheDocument();
    expect(screen.getByText('Partial payment')).toBeInTheDocument();
    expect(screen.getByText('₹70.00')).toBeInTheDocument();
  });

  test('shows a useful empty state when no payment transactions exist', () => {
    render(<CustomerManagementPage customers={[{ ...customer, paymentTransactions: [] }]} records={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Transactions (0)' }));
    expect(screen.getByText('No transaction history found yet.')).toBeInTheDocument();
  });
});
