import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FakeDojo } from './fake-server.js';
import { renderApp } from './render.js';

describe('Answer with the Sensei', () => {
  it('posts a Rep with the Sensei Result and shows the notes, without a confirm tap', async () => {
    const dojo = new FakeDojo();
    dojo.checks.push({ result: 'pass-with-notes', notes: '- say *why* order matters' });
    renderApp('/train?kata=python&scope=due', dojo);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Python · 2 left' });

    const answer = await screen.findByRole('button', { name: 'Answer' });
    await waitFor(() => expect(answer).toBeEnabled());
    await user.click(answer);
    await user.type(screen.getByRole('textbox', { name: 'Your answer' }), 'the interpreter state');
    await user.click(screen.getByRole('button', { name: 'Check with the Sensei' }));

    expect(await screen.findByLabelText('Sensei notes')).toHaveTextContent('order matters');
    expect(screen.getByRole('button', { name: 'Pass with notes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(dojo.requests.at(-1)).toMatchObject({
      url: '/api/sensei/check',
      body: { cardId: 'python/gil', answer: 'the interpreter state' },
    });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(dojo.reps).toMatchObject([{ card: 'python/gil', result: 'pass-with-notes' }]),
    );
  });

  it('disables Answer with the reason while the Sensei is not healthy', async () => {
    const dojo = new FakeDojo();
    dojo.senseiOk = false;
    renderApp('/train?kata=python&scope=due', dojo);

    await screen.findByRole('heading', { name: 'Python · 2 left' });
    await screen.findByText('The Sensei is unavailable: not logged in');

    expect(screen.getByRole('button', { name: 'Answer' })).toBeDisabled();
  });

  it('keeps the conversation while the Card is on screen and sends it whole', async () => {
    const dojo = new FakeDojo();
    dojo.replies.push('Because the index changes.', 'Yes.');
    renderApp('/train?kata=python&scope=due', dojo);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Python · 2 left' });
    await user.click(screen.getByRole('button', { name: 'Know' }));
    const ask = screen.getByRole('button', { name: 'Ask the Sensei' });
    await waitFor(() => expect(ask).toBeEnabled());

    await user.click(ask);
    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'Why?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Because the index changes.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'Sure?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Yes.');

    expect(dojo.requests.filter((r) => r.url === '/api/sensei/chat').at(-1)?.body).toEqual({
      cardId: 'python/gil',
      history: [
        { role: 'learner', text: 'Why?' },
        { role: 'sensei', text: 'Because the index changes.' },
      ],
      message: 'Sure?',
    });
  });
});
