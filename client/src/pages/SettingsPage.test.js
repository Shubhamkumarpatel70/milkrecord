import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  test('saves business name, rate, unit, and optional UPI ID', async () => {
    const onSaveConfiguration = jest.fn().mockResolvedValue({});
    render(
      <SettingsPage
        businessProfile={{ shopName: 'Test Dairy', milkRate: 35, quantityUnit: 'kg' }}
        upiId="test@upi"
        onSaveConfiguration={onSaveConfiguration}
        onStartTour={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Shop / Brand Name'), { target: { value: 'Ayush Dairy' } });
    fireEvent.change(screen.getByLabelText('Default Milk Rate (₹ / Kg)'), { target: { value: '42.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Liter (L)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save All Configuration' }));

    await waitFor(() => expect(onSaveConfiguration).toHaveBeenCalledWith({
      shopName: 'Ayush Dairy',
      milkRate: 42.5,
      quantityUnit: 'liter',
      upiId: 'test@upi'
    }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('validates the shop name before saving', async () => {
    const onSaveConfiguration = jest.fn();
    render(<SettingsPage onSaveConfiguration={onSaveConfiguration} />);
    fireEvent.change(screen.getByLabelText('Shop / Brand Name'), { target: { value: 'A' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Save All Configuration' }).closest('form'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('2 characters'));
    expect(onSaveConfiguration).not.toHaveBeenCalled();
  });
});
