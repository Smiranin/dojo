import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render.js';

describe('filters', () => {
  it('narrows the Card list and the Train links by Tag and Difficulty', async () => {
    renderApp('/kata/react');
    const user = userEvent.setup();
    const cards = await screen.findByRole('list', { name: 'Cards' });

    await user.click(screen.getByRole('button', { name: /^performance:/ }));
    expect(within(cards).getAllByRole('listitem')).toHaveLength(2);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Difficulty' }), 'medium');

    expect(within(cards).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Train Due (2)' })).toHaveAttribute(
      'href',
      '/train?kata=react&tags=performance&difficulty=medium&scope=due',
    );
  });

  it('searches Katas by name on Home', async () => {
    renderApp('/');
    const user = userEvent.setup();
    await screen.findByRole('list', { name: 'Katas' });

    await user.type(screen.getByRole('searchbox', { name: 'Search Katas' }), 'py');

    expect(
      within(screen.getByRole('list', { name: 'Katas' })).getAllByRole('listitem'),
    ).toHaveLength(1);
  });
});
