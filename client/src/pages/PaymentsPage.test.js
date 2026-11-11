import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PaymentsPage from './PaymentsPage';

describe('PaymentsPage', () => {
  const customer = {
    _id: 'customer-1',
    name: 'Ayush',
    whatsapp: '9876543210',
    totalAmount: 210,
    paidAmount: 70,
    status: 'unpaid'
  };

  test('renders payment totals and opens settlement for a customer', () => {
    const onMarkPayment = jest.fn();
    const onOpenPaymentQR = jest.fn();
    render(
      <PaymentsPage
        totalReceive={70}
        totalPending={140}
        customers={[customer]}
        onMarkPayment={onMarkPayment}
        onOpenPaymentQR={onOpenPaymentQR}
        upiId="ayush@upi"
      />
    );

    expect(screen.getByText('₹ 70')).toBeInTheDocument();
    expect(screen.getByText('₹ 140')).toBeInTheDocument();
    expect(screen.getByText('ayush@upi')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Settle Payment' })[0]);
    expect(onMarkPayment).toHaveBeenCalledWith(customer);
    fireEvent.click(screen.getByRole('button', { name: /Generate UPI Payment QR/i }));
    expect(onOpenPaymentQR).toHaveBeenCalledTimes(1);
  });

  test('opens a WhatsApp reminder with the actual outstanding balance', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<PaymentsPage customers={[customer]} />);
    fireEvent.click(screen.getAllByTitle('Send WhatsApp Reminder')[0]);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toContain('https://wa.me/919876543210');
    expect(decodeURIComponent(open.mock.calls[0][0])).toContain('₹140');
    open.mockRestore();
  });
});
