import type { Belt } from '@dojo/core';
import { Badge } from './ui/badge.js';

const LABEL: Record<Belt, string> = { new: 'New', learning: 'Learning', known: 'Known' };
const VARIANT: Record<Belt, 'secondary' | 'warning' | 'success'> = {
  new: 'secondary',
  learning: 'warning',
  known: 'success',
};

export function BeltBadge({ belt }: { belt: Belt }) {
  return <Badge variant={VARIANT[belt]}>{LABEL[belt]}</Badge>;
}
