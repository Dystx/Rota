'use client';

import { useState } from 'react';
import { 
  PromptComposer, 
  type PromptComposerState,
  BriefConfirmation,
  BriefField,
  Button,
  CinematicGuide,
  GuideChapter,
  GuideProgress,
  GuidedNextStep,
  HeroSection,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@repo/ui';

export default function TestT15Page() {
  const [promptValue, setPromptValue] = useState("");
  const [promptState, setPromptState] = useState<PromptComposerState>('idle');
  const [showBrief, setShowBrief] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handlePromptSubmit = () => {
    setPromptState('loading');
    setTimeout(() => {
      setPromptState('follow-up');
    }, 4500);
  };

  const handleFollowUpSubmit = () => {
    setPromptState('idle');
    setShowBrief(true);
    setStatusMessage("");
  };

  const handleEditBrief = (field: string) => {
    setStatusMessage(`Edit requested for ${field}. (This is a local UI demo).`);
  };

  const handleConfirm = () => {
    setStatusMessage("Confirmed! Proceeding to the next step. (This is a local UI demo).");
  };

  const handleStartOver = () => {
    setShowBrief(false);
    setPromptState('idle');
    setPromptValue("");
    setStatusMessage("");
  };

  return (
    <CinematicGuide>
      <GuideProgress 
        chapters={[
          { id: 'intro', label: 'Start' },
          { id: 'composer', label: 'Prompt' },
          ...(showBrief ? [{ id: 'brief', label: 'Brief' }] : [])
        ]} 
      />

      <GuideChapter id="intro">
        <HeroSection 
          title="T15: Prompt Composer"
          subtitle="Testing the Layla-style trip generation UI primitives."
        />
      </GuideChapter>

      <GuideChapter id="composer">
        <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="rota-display text-4xl mb-4 text-[var(--color-ink)]">Tell us your dream trip</h2>
            <p className="text-lg text-[var(--color-muted-foreground)]">Our AI concierge will draft a perfectly paced itinerary.</p>
          </div>
          
          <PromptComposer
            promptValue={promptValue}
            onPromptChange={setPromptValue}
            state={promptState}
            onSubmit={handlePromptSubmit}
            examplePrompts={[
              "A 7-day relaxing food tour in the Douro Valley",
              "10 days exploring historic Lisbon and Sintra",
              "A family beach trip to the Algarve"
            ]}
            followUpPanel={
              <Card className="mt-4 bg-[var(--color-cream)]/50">
                <CardHeader>
                  <CardTitle className="text-xl">One quick question...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--color-ink)] mb-4 text-sm">You didn't mention a budget. What level of accommodation are you looking for?</p>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleFollowUpSubmit} className="flex-1 text-sm bg-white/50">Mid-range</Button>
                    <Button variant="ghost" onClick={handleFollowUpSubmit} className="flex-1 text-sm bg-white/50">Premium</Button>
                  </div>
                </CardContent>
              </Card>
            }
          />
        </div>
      </GuideChapter>

      {showBrief && (
        <GuideChapter id="brief">
           <GuidedNextStep className="mb-8">
             <h2 className="rota-display text-3xl">Ready to review</h2>
           </GuidedNextStep>
           <div className="px-6 md:px-12 pb-32 flex flex-col items-center">
            
            {statusMessage && (
              <div 
                role="status" 
                aria-live="polite" 
                className="mb-6 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] p-4 text-[var(--color-ink)] text-sm font-medium w-full max-w-2xl text-center"
              >
                {statusMessage}
              </div>
            )}

            <BriefConfirmation
              actions={
                <>
                  <Button variant="ghost" onClick={handleStartOver}>Start over</Button>
                  <Button onClick={handleConfirm}>Save & Continue</Button>
                </>
              }
            >
              <BriefField label="Destination" value="Portugal" />
              <BriefField label="Regions" value="Douro Valley, Porto" onEdit={() => handleEditBrief('Regions')} />
              <BriefField label="Travelers" value="2 Adults (Couple)" onEdit={() => handleEditBrief('Travelers')} />
              <BriefField label="Pace" value="Relaxing" onEdit={() => handleEditBrief('Pace')} />
              <BriefField label="Budget" value="Mid-range" onEdit={() => handleEditBrief('Budget')} />
              <BriefField label="Interests" value="Wine, Local food, Nature" onEdit={() => handleEditBrief('Interests')} />
            </BriefConfirmation>
          </div>
        </GuideChapter>
      )}
    </CinematicGuide>
  );
}
