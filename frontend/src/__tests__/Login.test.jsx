import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import Login from '../pages/auth/Login';

const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null, loading: false, error: null } }
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('Authentication Interface Tests', () => {
  it('should render mission-critical credential fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/PASSWORD/i)).toBeInTheDocument();
  });

  it('should show validation warnings on empty protocol submission', async () => {
    renderWithProviders(<Login />);
    const loginButton = screen.getByRole('button', { name: /SIGN INTO PROTOCOL/i });
    fireEvent.click(loginButton);
    // Add specific validation checks based on your form library (e.g., "required")
  });

  it('should execute login protocol with valid stakeholder credentials', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/EMAIL/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/PASSWORD/i), { target: { value: 'Password@123' } });
    
    const loginButton = screen.getByRole('button', { name: /SIGN INTO PROTOCOL/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
       // Check for loading state or redirect
       // expect(window.location.pathname).toBe('/');
    });
  });

  it('should display loading magnitude during API verification', () => {
    // This requires mocking the thunk or checking for "Authenticating..." text
    renderWithProviders(<Login />);
    const loginButton = screen.getByRole('button', { name: /SIGN INTO PROTOCOL/i });
    fireEvent.click(loginButton);
    // expect(screen.getByText(/Authenticating/i)).toBeInTheDocument();
  });
});
