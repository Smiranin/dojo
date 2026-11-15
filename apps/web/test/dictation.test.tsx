import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { FakeKobzar } from './fake-kobzar.js';
import {
  FAKE_SPEECH,
  installFakeMedia,
  type FakeMedia,
  type FakeMediaOptions,
} from './fake-media.js';
import { FakeDojo } from './fake-server.js';
import { renderApp } from './render.js';

const TRAINING = '/train?kata=python&scope=due';
const BUSY = { status: 503, code: 'busy', message: 'Kobzar is busy with another recording.' };

type User = ReturnType<typeof userEvent.setup>;

/** Opens the answer sheet of the first Card of the Python Training. */
async function openAnswerSheet(user: User): Promise<HTMLElement> {
  const answer = await screen.findByRole('button', { name: 'Answer' });
  await waitFor(() => expect(answer).toBeEnabled());
  await user.click(answer);
  return screen.findByRole('textbox', { name: 'Your answer' });
}

/** Taps the microphone once Kobzar is ready and waits until the recording runs. */
async function startDictation(user: User): Promise<void> {
  const dictate = await screen.findByRole('button', { name: 'Dictate' });
  await waitFor(() => expect(dictate).toBeEnabled());
  await user.click(dictate);
  await screen.findByRole('button', { name: 'Stop dictation' });
}

describe('Dictation', () => {
  let media: FakeMedia | null = null;
  const withMicrophone = (options?: FakeMediaOptions): FakeMedia => {
    media = installFakeMedia(options);
    return media;
  };
  afterEach(() => {
    media?.uninstall();
    media = null;
    localStorage.clear();
  });

  it('shows no microphone button while Kobzar is not configured', async () => {
    withMicrophone();
    renderApp(TRAINING);
    const user = userEvent.setup();

    await openAnswerSheet(user);

    expect(screen.queryByRole('button', { name: 'Dictate' })).not.toBeInTheDocument();
  });

  it('shows no Settings on Home while Kobzar is not configured', async () => {
    renderApp('/');

    await screen.findByRole('list', { name: 'Katas' });

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('appends the dictated text to what was typed and does not ask the Sensei', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push(' and not your data\n');
    const { dojo } = renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);
    await user.type(field, 'the interpreter state');

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() => expect(field).toHaveValue('the interpreter state and not your data'));
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeEnabled();
    expect(dojo.requests.filter((r) => r.url.startsWith('/api/sensei'))).toEqual([]);
  });

  it('sends Russian, the hints of the Card’s Kata and the recorded speech to Kobzar', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('текст');
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() => expect(field).toHaveValue('текст'));
    expect(kobzar.received).toEqual([
      {
        language: 'ru',
        hints: ['Python', 'data-model', 'async', 'typing'],
        hintsSent: true,
        recordingSize: FAKE_SPEECH.length,
        recordingType: 'audio/webm',
        recordingName: 'recording.webm',
      },
    ]);
  });

  it('shows the recording with its elapsed time, then that it waits for the text', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcriptDelayMs = 150;
    kobzar.transcripts.push('done');
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);

    await startDictation(user);
    expect(screen.getByText('Recording 0:00')).toHaveAttribute('role', 'status');
    expect(await screen.findByText('Recording 0:01', {}, { timeout: 3_000 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    expect(await screen.findByText('Waiting for the text…')).toHaveAttribute('role', 'status');
    await waitFor(() => expect(field).toHaveValue('done'));
  });

  it('leaves the field as it was and sends nothing when the dictation is cancelled', async () => {
    const microphone = withMicrophone();
    const kobzar = new FakeKobzar();
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);
    await user.type(field, 'typed');

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Cancel dictation' }));

    expect(await screen.findByRole('button', { name: 'Dictate' })).toBeEnabled();
    expect(field).toHaveValue('typed');
    expect(kobzar.received).toEqual([]);
    expect(microphone.tracksStopped()).toBe(1);
  });

  it('leaves the field unchanged when Kobzar heard no speech', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('  ');
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);
    await user.type(field, 'typed');

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    expect(await screen.findByRole('button', { name: 'Dictate' })).toBeEnabled();
    expect(kobzar.received).toHaveLength(1);
    expect(field).toHaveValue('typed');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows Kobzar’s message after a failure and sends the same speech again on every Retry', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push(BUSY, BUSY, 'at last');
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(BUSY.message);
    expect(field).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Retry dictation' }));
    await waitFor(() => expect(kobzar.received).toHaveLength(2));
    expect(await screen.findByRole('alert')).toHaveTextContent(BUSY.message);

    await user.click(screen.getByRole('button', { name: 'Retry dictation' }));
    await waitFor(() => expect(field).toHaveValue('at last'));

    expect(kobzar.received).toHaveLength(3);
    for (const request of kobzar.received) {
      expect(request).toMatchObject({
        recordingSize: FAKE_SPEECH.length,
        recordingType: 'audio/webm',
      });
    }
    expect(screen.queryByRole('button', { name: 'Retry dictation' })).not.toBeInTheDocument();
  });

  it('shows Kobzar’s message when Kobzar fails inside itself', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    const message = 'Kobzar failed inside itself.';
    kobzar.transcripts.push({ status: 500, code: 'internal_error', message });
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await openAnswerSheet(user);

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  it('disables the button with a note while Kobzar is down and enables it when Kobzar is back', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.health = 'down';
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await openAnswerSheet(user);

    expect(await screen.findByText('Kobzar is unreachable.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeDisabled();

    kobzar.health = 'ready';

    await waitFor(() => expect(screen.getByRole('button', { name: 'Dictate' })).toBeEnabled());
    expect(screen.queryByText('Kobzar is unreachable.')).not.toBeInTheDocument();
  });

  it('disables the button with its own note while Kobzar is starting', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.health = 'loading';
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await openAnswerSheet(user);

    expect(await screen.findByText('Kobzar is starting.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeDisabled();
  });

  it('says that the browser has no permission when the microphone is refused', async () => {
    const microphone = withMicrophone({ permission: 'denied' });
    const kobzar = new FakeKobzar();
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await openAnswerSheet(user);
    const dictate = screen.getByRole('button', { name: 'Dictate' });
    await waitFor(() => expect(dictate).toBeEnabled());

    await user.click(dictate);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The browser has no permission to use the microphone. Allow it for the Dojo in the browser's settings.",
    );
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeEnabled();
    expect(microphone.recordersStarted()).toBe(0);
  });

  it('stops by itself at the limit, says so and still delivers the text', async () => {
    const microphone = withMicrophone();
    const kobzar = new FakeKobzar();
    // The Dojo stops two seconds before Kobzar's limit: a real limit of one second.
    kobzar.maxRecordingSeconds = 3;
    kobzar.transcriptDelayMs = 300;
    kobzar.transcripts.push('everything said in time');
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const field = await openAnswerSheet(user);

    await startDictation(user);

    expect(
      await screen.findByText(
        'Recording stopped at the five-minute limit.',
        {},
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(field).toHaveValue('everything said in time'));
    expect(microphone.tracksStopped()).toBe(1);
  });

  it('releases the microphone and sends nothing when the sheet is closed while recording', async () => {
    const microphone = withMicrophone();
    const kobzar = new FakeKobzar();
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await openAnswerSheet(user);
    await startDictation(user);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'Your answer' })).not.toBeInTheDocument(),
    );

    expect(microphone.tracksStopped()).toBe(1);
    await openAnswerSheet(user);
    expect(await screen.findByRole('button', { name: 'Dictate' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Stop dictation' })).not.toBeInTheDocument();
    expect(kobzar.received).toEqual([]);
  });

  it('disables the button with a note when the browser cannot record', async () => {
    const kobzar = new FakeKobzar();
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();

    await openAnswerSheet(user);

    expect(
      await screen.findByText('Dictation needs the Dojo opened over HTTPS.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeDisabled();
  });

  it('takes a dictated follow-up question with the hints of the Card’s Kata', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('why is that');
    renderApp(TRAINING, new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Know' }));
    const ask = screen.getByRole('button', { name: 'Ask the Sensei' });
    await waitFor(() => expect(ask).toBeEnabled());
    await user.click(ask);

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Your question' })).toHaveValue('why is that'),
    );
    expect(kobzar.received[0]?.hints).toEqual(['Python', 'data-model', 'async', 'typing']);
  });

  it('takes a dictated request for Cards with the hints of the Kata it is about', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('add two cards about suspense');
    renderApp('/kata/react', new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const add = await screen.findByRole('button', { name: 'Add Cards with the Sensei' });
    await waitFor(() => expect(add).toBeEnabled());
    await user.click(add);

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Instruction' })).toHaveValue(
        'add two cards about suspense',
      ),
    );
    expect(kobzar.received[0]?.hints).toEqual([
      'React',
      'hooks',
      'rendering',
      'state-management',
      'performance',
    ]);
  });

  it('takes a dictated request for a new Kata and sends no hints', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('Go: goroutines and channels');
    renderApp('/', new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    const newKata = await screen.findByRole('button', { name: 'New Kata' });
    await waitFor(() => expect(newKata).toBeEnabled());
    await user.click(newKata);

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Instruction' })).toHaveValue(
        'Go: goroutines and channels',
      ),
    );
    expect(kobzar.received[0]).toMatchObject({ hints: [], hintsSent: false });
  });

  it('takes a dictated quick note, sends no hints and saves nothing by itself', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('ask about Suspense');
    const { dojo } = renderApp('/', new FakeDojo(), { kobzar });
    const user = userEvent.setup();
    await screen.findByRole('list', { name: 'Katas' });
    await user.click(screen.getByRole('button', { name: 'Quick note' }));

    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('ask about Suspense'),
    );
    expect(kobzar.received[0]).toMatchObject({ hints: [], hintsSent: false });
    expect(dojo.inbox).toEqual([]);
  });

  it('dictates in English once it is chosen in Settings and remembers the choice', async () => {
    withMicrophone();
    const kobzar = new FakeKobzar();
    kobzar.transcripts.push('a note in English');
    const first = renderApp('/', new FakeDojo(), { kobzar });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Settings' }));
    const language = screen.getByRole('combobox', { name: 'Dictation language' });
    expect(language).toHaveValue('ru');
    await user.selectOptions(language, 'en');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Quick note' }));
    await startDictation(user);
    await user.click(screen.getByRole('button', { name: 'Stop dictation' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('a note in English'),
    );
    expect(kobzar.received[0]?.language).toBe('en');

    first.unmount();
    renderApp('/', new FakeDojo(), { kobzar });
    await user.click(await screen.findByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('combobox', { name: 'Dictation language' })).toHaveValue('en');
  });
});
