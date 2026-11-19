import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakeDojo } from './fake-server.js';
import { renderApp } from './render.js';

const TRAINING = '/train?kata=python&scope=due';

type User = ReturnType<typeof userEvent.setup>;

/** Renders the Python Training and waits for its first Card. */
async function startTraining(dojo = new FakeDojo()): Promise<{ dojo: FakeDojo; user: User }> {
  renderApp(TRAINING, dojo);
  const user = userEvent.setup();
  await screen.findByRole('heading', { name: 'Python · 2 left' });
  return { dojo, user };
}

/** Taps Kumite once the Sensei is healthy and returns the Kumite input. */
async function openKumite(user: User): Promise<HTMLElement> {
  const kumite = await screen.findByRole('button', { name: 'Kumite' });
  await waitFor(() => expect(kumite).toBeEnabled());
  await user.click(kumite);
  return screen.getByRole('textbox', { name: 'Your Kumite' });
}

/** Taps Know, then Ask the Sensei once the Sensei is healthy, and returns the Chat input. */
async function askAfterKnow(user: User): Promise<HTMLElement> {
  await user.click(screen.getByRole('button', { name: 'Know' }));
  const ask = screen.getByRole('button', { name: 'Ask the Sensei' });
  await waitFor(() => expect(ask).toBeEnabled());
  await user.click(ask);
  return screen.getByRole('textbox', { name: 'Your message' });
}

/** Every request the web sent to a Sensei route, in order. */
const senseiRequests = (dojo: FakeDojo) =>
  dojo.requests.filter((r) => r.url.startsWith('/api/sensei'));

describe('Kumite', () => {
  it('only opens the input and sends nothing', async () => {
    const { dojo, user } = await startTraining();

    const field = await openKumite(user);

    expect(field).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Know' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(senseiRequests(dojo)).toEqual([]);
  });

  it('brings back the four buttons on Cancel and keeps nothing', async () => {
    const { user } = await startTraining();
    await user.type(await openKumite(user), 'half an answer');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    for (const name of ['Kumite', "Don't know", 'Skip', 'Know']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('textbox', { name: 'Your Kumite' })).not.toBeInTheDocument();
    expect(await openKumite(user)).toHaveValue('');
  });

  it('shows the Kumite and the verdict as the first items of the Chat and records the Result', async () => {
    const dojo = new FakeDojo();
    dojo.kumites.push({ result: 'pass-with-notes', notes: '- say *why* order matters' });
    const { user } = await startTraining(dojo);

    await user.type(await openKumite(user), 'the interpreter state');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const verdict = await screen.findByRole('listitem', { name: 'Sensei verdict' });
    // The notes are Markdown with a list of their own; only the Chat's own items count.
    const items = [...screen.getByRole('list', { name: 'Chat' }).children];
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('the interpreter state');
    expect(items[1]).toBe(verdict);
    expect(verdict).toHaveTextContent('Pass with notes');
    expect(verdict).toHaveTextContent('order matters');
    expect(screen.getByRole('button', { name: 'Pass with notes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('textbox', { name: 'Your message' })).toHaveValue('');
    expect(screen.getByLabelText('Answer')).toHaveTextContent('interpreter state');
    expect(dojo.requests.at(-1)).toMatchObject({
      url: '/api/sensei/kumite',
      body: { cardId: 'python/gil', kumite: 'the interpreter state' },
    });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(dojo.reps).toMatchObject([{ card: 'python/gil', result: 'pass-with-notes' }]),
    );
  });

  it('shows only the label for a clean Pass', async () => {
    const dojo = new FakeDojo();
    dojo.kumites.push({ result: 'pass', notes: '' });
    const { user } = await startTraining(dojo);

    await user.type(await openKumite(user), 'the interpreter state');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const verdict = await screen.findByRole('listitem', { name: 'Sensei verdict' });
    expect(verdict).toHaveTextContent(/^Pass$/);
  });

  it('sends the Kumite and its verdict with a follow-up question', async () => {
    const dojo = new FakeDojo();
    dojo.kumites.push({ result: 'fail', notes: '- not the GC' });
    dojo.replies.push('The GIL guards reference counts.');
    const { user } = await startTraining(dojo);
    await user.type(await openKumite(user), 'the garbage collector');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    const message = await screen.findByRole('textbox', { name: 'Your message' });

    await user.type(message, 'Why was the GC wrong?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await screen.findByText('The GIL guards reference counts.');
    expect(dojo.requests.at(-1)).toMatchObject({
      url: '/api/sensei/chat',
      body: {
        cardId: 'python/gil',
        chat: {
          opening: {
            kind: 'kumite',
            kumite: 'the garbage collector',
            result: 'fail',
            notes: '- not the GC',
          },
          turns: [],
        },
        message: 'Why was the GC wrong?',
      },
    });
  });

  it('keeps the text and offers Retry when the Kumite fails, and records no Rep', async () => {
    const { dojo, user } = await startTraining();
    const field = await openKumite(user);
    await user.type(field, 'the interpreter state');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('no Sensei');
    expect(field).toHaveValue('the interpreter state');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Know' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(dojo.reps).toHaveLength(1));
    expect(dojo.reps).toMatchObject([{ card: 'python/gil', result: 'pass' }]);
  });

  it('commits the Result the learner chose over the verdict', async () => {
    const dojo = new FakeDojo();
    dojo.kumites.push({ result: 'fail', notes: '- wrong' });
    const { user } = await startTraining(dojo);
    await user.type(await openKumite(user), 'the interpreter state');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByRole('listitem', { name: 'Sensei verdict' });

    await user.click(screen.getByRole('button', { name: 'Pass' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(dojo.reps).toMatchObject([{ card: 'python/gil', result: 'pass' }]));
  });

  it('disables Kumite with the reason while the Sensei is not healthy', async () => {
    const dojo = new FakeDojo();
    dojo.senseiOk = false;
    await startTraining(dojo);

    await screen.findByText('The Sensei is unavailable: not logged in');

    expect(screen.getByRole('button', { name: 'Kumite' })).toBeDisabled();
  });
});

describe('Chat on the Card screen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens on the screen after Know and lists the replies in order', async () => {
    const dojo = new FakeDojo();
    dojo.replies.push('Because the index changes.', 'Yes.');
    const { user } = await startTraining(dojo);
    const field = await askAfterKnow(user);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.type(field, 'Why?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Because the index changes.');
    await user.type(field, 'Sure?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Yes.');

    const items = within(screen.getByRole('list', { name: 'Chat' })).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Why?',
      'Because the index changes.',
      'Sure?',
      'Yes.',
    ]);
    expect(dojo.requests.filter((r) => r.url === '/api/sensei/chat').at(-1)?.body).toEqual({
      cardId: 'python/gil',
      chat: {
        opening: { kind: 'self-graded', choice: 'know' },
        turns: [
          { role: 'learner', text: 'Why?' },
          { role: 'sensei', text: 'Because the index changes.' },
        ],
      },
      message: 'Sure?',
    });
  });

  it('shows that the Sensei is thinking under the message on its way', async () => {
    const dojo = new FakeDojo();
    dojo.replies.push('Later.');
    const { user } = await startTraining(dojo);
    const field = await askAfterKnow(user);
    const release = dojo.hold();

    await user.type(field, 'Why?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const waiting = await screen.findByText('The Sensei is thinking…');
    const list = screen.getByRole('list', { name: 'Chat' });
    expect(within(list).getAllByRole('listitem').at(-1)).toHaveTextContent('Why?');
    expect(list.compareDocumentPosition(waiting) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(field).toBeDisabled();
    release();
    await screen.findByText('Later.');
    expect(screen.queryByText('The Sensei is thinking…')).not.toBeInTheDocument();
  });

  it('keeps the text and shows the reason with Retry when the Sensei fails, and Retry resends', async () => {
    const { dojo, user } = await startTraining();
    const field = await askAfterKnow(user);
    await user.type(field, 'Why?');

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('no Sensei');
    expect(field).toHaveValue('Why?');
    expect(screen.queryByRole('list', { name: 'Chat' })).not.toBeInTheDocument();

    dojo.replies.push('Now I can.');
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByText('Now I can.');
    expect(field).toHaveValue('');
    expect(dojo.requests.filter((r) => r.url === '/api/sensei/chat')).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('aborts a reply on its way on Next and shows the next Card without a Chat', async () => {
    const dojo = new FakeDojo();
    dojo.replies.push('Nobody reads this.');
    const { user } = await startTraining(dojo);
    const field = await askAfterKnow(user);
    const release = dojo.hold();
    await user.type(field, 'Why?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('The Sensei is thinking…');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByLabelText('Question')).toHaveTextContent('__hash__');
    expect(screen.queryByRole('region', { name: 'Sensei chat' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(dojo.requests.find((r) => r.url === '/api/sensei/chat')?.aborted).toBe(true),
    );
    await waitFor(() => expect(dojo.reps).toMatchObject([{ card: 'python/gil', result: 'pass' }]));
    release();
    expect(screen.queryByText('Nobody reads this.')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('scrolls a new reply to its first line', async () => {
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView');
    const dojo = new FakeDojo();
    dojo.replies.push('A long reply.');
    const { user } = await startTraining(dojo);
    const field = await askAfterKnow(user);

    await user.type(field, 'Why?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('A long reply.');

    expect(scroll).toHaveBeenLastCalledWith({ block: 'start' });
    expect(scroll.mock.contexts.at(-1)).toHaveTextContent('A long reply.');
  });

  it('hides the Quick note button while the Chat is open', async () => {
    const { user } = await startTraining();
    expect(screen.getByRole('button', { name: 'Quick note' })).toBeInTheDocument();

    await openKumite(user);

    expect(screen.queryByRole('button', { name: 'Quick note' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Quick note' })).toBeInTheDocument();
  });

  it('saves the Chat with its opening as a Card', async () => {
    const dojo = new FakeDojo();
    dojo.kumites.push({ result: 'pass-with-notes', notes: '- name the lock' });
    dojo.replies.push('It is a mutex.');
    dojo.authored.push({ kataId: 'python', cards: ['python/gil-mutex'], issues: [] });
    const { user } = await startTraining(dojo);
    await user.type(await openKumite(user), 'the interpreter state');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    const message = await screen.findByRole('textbox', { name: 'Your message' });
    await user.type(message, 'What lock?');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('It is a mutex.');

    await user.click(screen.getByRole('button', { name: 'Save chat as Card' }));
    await user.click(screen.getByRole('button', { name: 'Ask the Sensei' }));

    await screen.findByText(/The Sensei wrote 1 Card/);
    expect(dojo.requests.at(-1)?.url).toBe('/api/sensei/author');
    expect(dojo.requests.at(-1)?.body).toMatchObject({
      kind: 'from-chat',
      kataId: 'python',
      context: {
        chat: {
          opening: {
            kind: 'kumite',
            kumite: 'the interpreter state',
            result: 'pass-with-notes',
            notes: '- name the lock',
          },
          turns: [
            { role: 'learner', text: 'What lock?' },
            { role: 'sensei', text: 'It is a mutex.' },
          ],
        },
      },
    });
  });
});
