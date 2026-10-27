import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render.js';

describe('Home', () => {
  it('lists the Katas with Due counts, pinned first', async () => {
    renderApp('/');

    const list = await screen.findByRole('list', { name: 'Katas' });
    const items = within(list).getAllByRole('listitem');

    expect(items.map((i) => i.textContent)).toEqual([
      expect.stringContaining('React'),
      expect.stringContaining('Python'),
    ]);
    expect(within(items[0]!).getByText('5 Due')).toBeInTheDocument();
    expect(within(items[0]!).getByText('5 New · 0 Learning · 0 Known')).toBeInTheDocument();
  });

  it('shows the Due total, Reps today and the streak, and offers Train all Due', async () => {
    const { dojo } = renderApp('/');
    void dojo;

    const today = await screen.findByLabelText('Today');

    expect(today).toHaveTextContent('7');
    expect(today).toHaveTextContent('Reps today');
    expect(screen.getByRole('link', { name: 'Train all Due (7)' })).toHaveAttribute(
      'href',
      '/train?scope=due',
    );
  });
});
