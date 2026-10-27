import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render.js';

describe('Training', () => {
  it("runs Don't know, Know and Next through two Cards and posts the Reps", async () => {
    const { dojo } = renderApp('/train?kata=python&scope=due');
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: 'Python · 2 left' });
    expect(screen.getByLabelText('Question')).toHaveTextContent('What does the GIL protect');
    expect(screen.queryByLabelText('Answer')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: "Don't know" }));
    expect(screen.getByLabelText('Answer')).toHaveTextContent('interpreter state');
    expect(screen.getByRole('button', { name: 'Fail' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // The failed Card is back at the end of the queue.
    expect(screen.getByRole('heading', { name: 'Python · 2 left' })).toBeInTheDocument();
    expect(screen.getByLabelText('Question')).toHaveTextContent('__hash__');
    await user.click(screen.getByRole('button', { name: 'Know' }));
    await user.click(screen.getByRole('button', { name: 'Pass with notes' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByLabelText('Question')).toHaveTextContent('What does the GIL protect');
    await user.click(screen.getByRole('button', { name: 'Know' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const summary = await screen.findByLabelText('Training summary');
    expect(summary).toHaveTextContent('3 Reps: 1 Pass, 1 Pass with notes, 1 Fail.');
    await waitFor(() => expect(dojo.reps).toHaveLength(3));
    expect(dojo.reps.map((r) => [r.card, r.result])).toEqual([
      ['python/gil', 'fail'],
      ['python/dunder-eq-hash', 'pass-with-notes'],
      ['python/gil', 'pass'],
    ]);
    expect(new Set(dojo.reps.map((r) => r.id)).size).toBe(3);
  });

  it('skips once to the end and drops on the second skip without a Rep', async () => {
    const { dojo } = renderApp('/train?kata=python&scope=due');
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Python · 2 left' });

    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.getByLabelText('Question')).toHaveTextContent('__hash__');
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.getByLabelText('Question')).toHaveTextContent('GIL');
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(await screen.findByLabelText('Training summary')).toHaveTextContent('0 Reps');
    expect(dojo.reps).toEqual([]);
  });

  it('ends early and commits the revealed Result', async () => {
    const { dojo } = renderApp('/train?scope=due');
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'All Katas · 7 left' });

    await user.click(screen.getByRole('button', { name: 'Know' }));
    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'End' }));

    expect(await screen.findByLabelText('Training summary')).toHaveTextContent('1 Rep: 1 Pass');
    await waitFor(() => expect(dojo.reps).toHaveLength(1));
  });
});
