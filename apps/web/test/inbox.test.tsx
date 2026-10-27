import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FakeDojo } from './fake-server.js';
import { renderApp } from './render.js';

describe('Inbox', () => {
  it('captures a quick note from Home and posts it with a device id', async () => {
    const { dojo } = renderApp('/');
    const user = userEvent.setup();
    await screen.findByRole('list', { name: 'Katas' });

    await user.click(screen.getByRole('button', { name: 'Quick note' }));
    await user.type(screen.getByRole('textbox', { name: 'Note' }), 'ask about Suspense');
    await user.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() => expect(dojo.inbox).toHaveLength(1));
    expect(dojo.inbox[0]).toMatchObject({ text: 'ask about Suspense' });
    expect(dojo.inbox[0]?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(screen.getByRole('link', { name: 'Inbox, 1 notes' })).toBeInTheDocument();
  });

  it('lists notes newest first, deletes with a confirmation and makes a Card of one', async () => {
    const dojo = new FakeDojo();
    dojo.inbox.push(
      { id: 'old', text: 'older note', at: '2026-10-01T10:00:00.000Z' },
      { id: 'new', text: 'newer note', at: '2026-10-02T10:00:00.000Z' },
    );
    dojo.authored.push({ kataId: 'react', cards: ['react/newer-note'], issues: [] });
    renderApp('/inbox', dojo);
    const user = userEvent.setup();

    const list = await screen.findByRole('list', { name: 'Notes' });
    const items = within(list).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('newer note');

    await user.click(within(items[1]!).getByRole('button', { name: 'Delete' }));
    await user.click(within(items[1]!).getByRole('button', { name: 'Delete note' }));
    await waitFor(() => expect(dojo.inbox.map((n) => n.id)).toEqual(['new']));

    const make = within(items[0]!).getByRole('button', { name: 'Make a Card' });
    await waitFor(() => expect(make).toBeEnabled());
    await user.click(make);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kata' }), 'react');
    await user.click(screen.getByRole('button', { name: 'Ask the Sensei' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'The Sensei wrote 1 Card to react.',
    );
    expect(dojo.requests.find((r) => r.url === '/api/sensei/author')?.body).toEqual({
      kind: 'from-inbox',
      instruction: '',
      kataId: 'react',
      context: { note: 'newer note' },
    });
    await waitFor(() => expect(dojo.inbox).toEqual([]));
  });
});
