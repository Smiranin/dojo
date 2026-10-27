import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FakeDojo } from './fake-server.js';
import { renderApp } from './render.js';

describe('Authoring', () => {
  it('asks the Sensei for Cards from the Kata screen and reports what was written', async () => {
    const dojo = new FakeDojo();
    dojo.authored.push({
      kataId: 'react',
      cards: ['react/rsc', 'react/rsc-2'],
      issues: ['Tag "suspense" is not in the Kata and was dropped'],
    });
    renderApp('/kata/react', dojo);
    const user = userEvent.setup();

    const add = await screen.findByRole('button', { name: 'Add Cards with the Sensei' });
    await waitFor(() => expect(add).toBeEnabled());
    await user.click(add);
    await user.type(screen.getByRole('textbox', { name: 'Instruction' }), 'add 2 cards about RSC');
    await user.click(screen.getByRole('button', { name: 'Ask the Sensei' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'The Sensei wrote 2 Cards to react.',
    );
    expect(
      screen.getByText('Tag "suspense" is not in the Kata and was dropped'),
    ).toBeInTheDocument();
    expect(dojo.requests.find((r) => r.url === '/api/sensei/author')?.body).toEqual({
      kind: 'add-cards',
      instruction: 'add 2 cards about RSC',
      kataId: 'react',
    });
  });

  it('deletes a Card from the Kata screen after a confirmation', async () => {
    const { dojo } = renderApp('/kata/python');
    const user = userEvent.setup();
    const cards = await screen.findByRole('list', { name: 'Cards' });
    const first = within(cards).getAllByRole('listitem')[0]!;

    await user.click(within(first).getByRole('button', { name: 'Delete' }));
    await user.click(within(first).getByRole('button', { name: 'Delete Card' }));

    await waitFor(() => expect(within(cards).getAllByRole('listitem')).toHaveLength(1));
    expect(dojo.requests).toEqual([
      { method: 'DELETE', url: '/api/cards/python/gil', body: undefined },
    ]);
  });

  it('shows the Sensei error inside the sheet and keeps it open', async () => {
    renderApp('/');
    const user = userEvent.setup();
    const newKata = await screen.findByRole('button', { name: 'New Kata' });
    await waitFor(() => expect(newKata).toBeEnabled());

    await user.click(newKata);
    await user.type(screen.getByRole('textbox', { name: 'Instruction' }), 'Go');
    await user.click(screen.getByRole('button', { name: 'Ask the Sensei' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('no Sensei');
    expect(screen.getByRole('textbox', { name: 'Instruction' })).toHaveValue('Go');
  });
});
