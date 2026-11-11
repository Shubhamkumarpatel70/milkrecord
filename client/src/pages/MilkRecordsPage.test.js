import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MilkRecordsPage from './MilkRecordsPage';

describe('MilkRecordsPage', () => {
  const records = [
    { _id: '1', customer: 'Ayush', createdAt: '2026-11-11T06:00:00.000Z', quantityKg: 2, amount: 70, shift: 'morning', status: 'paid' },
    { _id: '2', customer: 'Rishikesh', createdAt: '2026-11-11T14:00:00.000Z', quantityKg: 15, amount: 525, shift: 'evening', status: 'unpaid' }
  ];

  test('filters selected customer records and date-wise summary', () => {
    render(
      <MilkRecordsPage
        records={records}
        selectedMonth="2026-11"
        selectedCustomer={{ _id: 'customer-1', name: 'Ayush' }}
      />
    );
    expect(screen.getByRole('heading', { name: "Ayush's Milk Records" })).toBeInTheDocument();
    expect(screen.getByText('Ayush')).toBeInTheDocument();
    expect(screen.queryByText('Rishikesh')).not.toBeInTheDocument();
    expect(screen.getByText('70.00', { exact: false })).toBeInTheDocument();
  });

  test('shows and invokes the mobile edit action for a milk entry', () => {
    const onOpenEditRecord = jest.fn();
    render(
      <MilkRecordsPage
        records={records}
        selectedMonth="2026-11"
        onOpenEditRecord={onOpenEditRecord}
      />
    );
    const editButton = screen.getByRole('button', { name: 'Edit milk entry for Ayush on 2026-11-11' });
    fireEvent.click(editButton);
    expect(onOpenEditRecord).toHaveBeenCalledWith(records[0]);
  });
});
