import { CinematicHero } from './cinematic-hero';

type Meta<TComponent> = {
  title: string;
  component: TComponent;
  parameters?: Record<string, unknown>;
};

type StoryArgs<TMeta> = TMeta extends { component: (props: infer Props) => unknown }
  ? Partial<Props>
  : Record<string, never>;

type StoryObj<TMeta> = {
  args?: StoryArgs<TMeta>;
  parameters?: Record<string, unknown>;
};

const meta = {
  title: 'Trip/CinematicHero',
  component: CinematicHero,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CinematicHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'The Soul of the Alentejo',
    region: 'Alentejo, Portugal',
    durationDays: 14,
    coverImageUrl: 'https://images.unsplash.com/photo-1622384795551-789667793d9f?q=80&w=2000&auto=format&fit=crop',
  },
};

export const ReducedMotion: Story = {
  args: {
    title: 'The Soul of the Alentejo',
    region: 'Alentejo, Portugal',
    durationDays: 14,
    coverImageUrl: 'https://images.unsplash.com/photo-1622384795551-789667793d9f?q=80&w=2000&auto=format&fit=crop',
  },
  parameters: {
    chromatic: { viewports: [1440] },
    reducedMotion: 'reduce',
  },
};

export const Mobile: Story = {
  args: {
    title: 'The Soul of the Alentejo',
    region: 'Alentejo, Portugal',
    durationDays: 14,
    coverImageUrl: 'https://images.unsplash.com/photo-1622384795551-789667793d9f?q=80&w=800&auto=format&fit=crop',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    chromatic: { viewports: [390] },
  },
};
