import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ContactModal } from './ContactModal';

vi.mock('./animations/Cornfield', () => ({
  Cornfield: () => null,
}));

describe('ContactModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits validated form data and shows success feedback', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ContactModal isOpen={true} onClose={onClose} />);

    await user.type(screen.getByLabelText('Name'), 'Farmer Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(
      screen.getByLabelText('Message'),
      'I would like to learn more about your farm products and updates.'
    );

    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Farmer Jane',
        email: 'jane@example.com',
        message: 'I would like to learn more about your farm products and updates.',
      }),
    });

    expect(await screen.findByText('Thanks! Your message was sent. We will follow up soon.')).toBeInTheDocument();
  });

  it('shows validation error and does not call fetch when name is too short', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<ContactModal isOpen={true} onClose={onClose} />);

    await user.type(screen.getByLabelText('Name'), 'A');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Message'), 'short');

    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Please enter your name (at least 2 characters).')
    ).toBeInTheDocument();
  });

  it('shows API error feedback when submission fails', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Message delivery failed. Please try again shortly.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ContactModal isOpen={true} onClose={onClose} />);

    await user.type(screen.getByLabelText('Name'), 'Farmer John');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Message'), 'Need details on bulk produce ordering next week.');

    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Message delivery failed. Please try again shortly.')).toBeInTheDocument();
  });
});
