import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AuthScreen from './components/AuthScreen';

describe('AuthScreen', () => {
  test('renders the secure login form', () => {
    render(<AuthScreen onAuthenticated={jest.fn()} />);
    expect(screen.getByText('Milk Record')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login securely' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('10-digit mobile number')).toBeInTheDocument();
  });

  test('rejects an invalid mobile number before sending a request', () => {
    render(<AuthScreen onAuthenticated={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('10-digit mobile number'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('•••••'), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login securely' }));
    expect(screen.getByRole('alert')).toHaveTextContent('10-digit mobile number');
  });

  test('rejects an MPIN that is not five digits', () => {
    render(<AuthScreen onAuthenticated={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('10-digit mobile number'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('•••••'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login securely' }));
    expect(screen.getByRole('alert')).toHaveTextContent('MPIN exactly 5 digits');
  });

  test('switches to account registration mode', () => {
    render(<AuthScreen onAuthenticated={jest.fn()} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Create account' })[0]);
    expect(screen.getByText('Full name')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Create account' })).toHaveLength(2);
  });
});
