import { defineProject } from 'vitest/config';

export default defineProject({
  test: { name: 'sensei-claude', environment: 'node' },
});
