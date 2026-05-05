import type { Meta } from '@storybook/react';
import { useState } from 'react';
import { ChapterNav } from './chapter-nav';

const meta = {
  title: 'Components/ChapterNav',
  component: ChapterNav,
} satisfies Meta<typeof ChapterNav>;

export default meta;

export function InteractiveChapterNav() {
  const chapters = [
    { id: 'intro', label: 'Introduction' },
    { id: 'context', label: 'Context' },
    { id: 'plan', label: 'Plan' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ];
  const [activeChapterId, setActiveChapterId] = useState('intro');

  return (
    <ChapterNav
      chapters={chapters}
      activeChapterId={activeChapterId}
      onSelect={(chapterId) => setActiveChapterId(chapterId)}
    />
  );
}
