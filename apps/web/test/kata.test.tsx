import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render.js';

describe('Kata screen', () => {
  it('shows the Cards with their Belt and the Tag breakdown', async () => {
    renderApp('/kata/react');

    const cards = await screen.findByRole('list', { name: 'Cards' });

    expect(within(cards).getAllByRole('listitem')).toHaveLength(5);
    expect(within(cards).getAllByText('New')).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'Train Due (5)' })).toHaveAttribute(
      'href',
      '/train?kata=react&scope=due',
    );
    const tags = screen.getByRole('list', { name: 'Tags' });
    expect(within(tags).getByText('hooks: 0 of 2 Known')).toBeInTheDocument();
  });

  it('pins and unpins from the header and sends only that flag', async () => {
    const { dojo } = renderApp('/kata/python');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Pin' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Unpin' })).toBeInTheDocument());
    expect(dojo.requests).toEqual([
      { method: 'PATCH', url: '/api/katas/python', body: { pinned: true } },
    ]);
  });

  it('says so for an unknown Kata', async () => {
    renderApp('/kata/nope');

    expect(await screen.findByText('There is no Kata “nope”.')).toBeInTheDocument();
  });
});
