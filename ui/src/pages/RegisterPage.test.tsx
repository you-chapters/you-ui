import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage';
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';

const mockNavigate = vi.fn();
const mockRefresh = vi.fn();

vi.mock('aws-amplify/auth', () => ({ signUp: vi.fn(), confirmSignUp: vi.fn(), signIn: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ refresh: mockRefresh }),
}));

async function fillRegisterForm(displayName = 'Alice', email = 'alice@example.com', password = 'Pass123!', confirm = 'Pass123!') {
  await userEvent.type(screen.getByLabelText('Display name'), displayName);
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.type(screen.getByLabelText('Confirm password'), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks());

  function renderPage() {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
  }

  it('renders display name, email, password and confirm fields', () => {
    renderPage();
    expect(screen.getByLabelText('Display name')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByLabelText('Confirm password')).toBeTruthy();
  });

  it('shows error when passwords do not match', async () => {
    renderPage();
    await fillRegisterForm('Alice', 'alice@example.com', 'Pass123!', 'Different!');
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
  });

  it('calls signUp with email, password and preferred_username', async () => {
    vi.mocked(signUp).mockResolvedValue({} as any);
    renderPage();
    await fillRegisterForm();
    expect(signUp).toHaveBeenCalledWith({
      username: 'alice@example.com',
      password: 'Pass123!',
      options: { userAttributes: { email: 'alice@example.com', preferred_username: 'Alice' } },
    });
  });

  it('advances to the verification step after signUp', async () => {
    vi.mocked(signUp).mockResolvedValue({} as any);
    renderPage();
    await fillRegisterForm();
    await waitFor(() => expect(screen.getByText('Verify email')).toBeTruthy());
    expect(screen.getByLabelText('Verification code')).toBeTruthy();
  });

  it('shows the registered email in the confirmation hint', async () => {
    vi.mocked(signUp).mockResolvedValue({} as any);
    renderPage();
    await fillRegisterForm('Alice', 'alice@example.com');
    await waitFor(() => expect(screen.getByText('alice@example.com')).toBeTruthy());
  });

  it('calls confirmSignUp, signIn, refresh and navigates on verify', async () => {
    vi.mocked(signUp).mockResolvedValue({} as any);
    vi.mocked(confirmSignUp).mockResolvedValue({} as any);
    vi.mocked(signIn).mockResolvedValue({} as any);
    mockRefresh.mockResolvedValue(undefined);
    renderPage();
    await fillRegisterForm();
    await waitFor(() => screen.getByLabelText('Verification code'));
    await userEvent.type(screen.getByLabelText('Verification code'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify and sign in' }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(confirmSignUp).toHaveBeenCalledWith({ username: 'alice@example.com', confirmationCode: '123456' });
    expect(signIn).toHaveBeenCalledWith({ username: 'alice@example.com', password: 'Pass123!' });
  });

  it('shows error on signUp failure', async () => {
    vi.mocked(signUp).mockRejectedValue(new Error('UsernameExistsException'));
    renderPage();
    await fillRegisterForm();
    await waitFor(() => expect(screen.getByText('UsernameExistsException')).toBeTruthy());
  });

  it('shows error on confirmSignUp failure', async () => {
    vi.mocked(signUp).mockResolvedValue({} as any);
    vi.mocked(confirmSignUp).mockRejectedValue(new Error('Invalid verification code'));
    renderPage();
    await fillRegisterForm();
    await waitFor(() => screen.getByLabelText('Verification code'));
    await userEvent.type(screen.getByLabelText('Verification code'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify and sign in' }));
    await waitFor(() => expect(screen.getByText('Invalid verification code')).toBeTruthy());
  });
});
