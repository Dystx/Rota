import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Expert Chat page — Mock 1.6 (Level 2 Expert Chat).
 *
 * Source: docs/prototype.html (ExpertChatPage component).
 * Two-column layout: itinerary timeline on the left, conversation thread
 * on the right. Maps to the Tier 2 async chat triage model from
 * docs/spec-v4.md §2. Chat messages and the textarea are static — the
 * real triage queue is wired by the Tier 3 backend agent.
 */
export default function ExpertChatPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height h-screen flex flex-col font-body-md text-body-md">
        <main id="main-content" className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
          {/* Left Side: Visual Timeline */}
          <aside className="hidden lg:flex flex-col w-1/3 max-w-sm border-r border-olive-light/10 bg-surface-container-low/50 overflow-y-auto scrollbar-hide p-container-padding-lg">
            <div className="mb-section-gap">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-2">
                Kyoto Autumn Retreat
              </h2>
              <div className="flex items-center gap-2 text-on-surface-variant font-mono-technical text-mono-technical">
                <span className="material-symbols-outlined text-[16px]">
                  calendar_today
                </span>
                <span>Oct 12 - Oct 20</span>
              </div>
            </div>
            <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-olive-light/20">
              {/* Timeline Node 1 */}
              <div className="relative">
                <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-surface-container-highest border-2 border-olive-light flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-olive-light" />
                </div>
                <div className="bg-glass-light/65 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-sm">
                  <div className="font-mono-micro text-mono-micro text-olive-light/70 uppercase tracking-wider mb-1">
                    Day 1 • Oct 12
                  </div>
                  <h3 className="font-label-ui text-label-ui text-primary mb-2">
                    Arrival &amp; Check-in
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    Arrive at KIX, transfer to The Ritz-Carlton Kyoto via
                    private car.
                  </p>
                </div>
              </div>
              {/* Timeline Node 2 (Active/Discussing) */}
              <div className="relative">
                <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-ochre-light/20 border-2 border-ochre-dark flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-ochre-dark animate-pulse" />
                </div>
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-ochre-light/50 shadow-md ring-1 ring-ochre-light/20">
                  <div className="font-mono-micro text-mono-micro text-ochre-dark uppercase tracking-wider mb-1">
                    Day 2 • Oct 13
                  </div>
                  <h3 className="font-label-ui text-label-ui text-primary mb-2">
                    Higashiyama Exploration
                  </h3>
                  <div className="w-full h-24 mb-2 rounded-lg overflow-hidden relative">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://picsum.photos/seed/higashiyama-walk/400/200')",
                      }}
                    />
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    Morning walking tour with local historian.
                  </p>
                </div>
              </div>
              {/* Timeline Node 3 */}
              <div className="relative opacity-60">
                <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-surface-container-highest border-2 border-olive-light/30 flex items-center justify-center z-10" />
                <div className="bg-glass-light/40 backdrop-blur-md p-4 rounded-xl border border-white/30">
                  <div className="font-mono-micro text-mono-micro text-olive-light/50 uppercase tracking-wider mb-1">
                    Day 3 • Oct 14
                  </div>
                  <h3 className="font-label-ui text-label-ui text-primary mb-2">
                    Arashiyama Bamboo Grove
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1">
                    Early morning access to bamboo forest.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Side: Chat Stream */}
          <section className="flex-1 flex flex-col bg-surface relative">
            {/* Chat Header */}
            <div className="h-16 flex items-center px-container-padding-lg border-b border-olive-light/10 bg-glass-light/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    alt="Ana - Local Specialist"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    src="https://i.pravatar.cc/80?img=47"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary leading-tight">
                    Ana
                  </h2>
                  <p className="font-mono-micro text-mono-micro text-olive-light uppercase tracking-wider">
                    Kyoto Specialist • Online
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-container-padding-lg space-y-section-gap scrollbar-hide flex flex-col justify-end pb-8">
              <div className="flex justify-center">
                <span className="font-mono-micro text-mono-micro text-on-surface-variant/60 uppercase tracking-widest bg-surface-container-high/50 px-3 py-1 rounded-full">
                  Today
                </span>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-sm font-body-md text-body-md">
                  <p>
                    Hi Ana! I was looking at Day 2. Do you think we have enough
                    time to fit in a tea ceremony after the walking tour, or
                    will it feel too rushed?
                  </p>
                </div>
              </div>
              <div className="flex justify-start gap-3">
                <img
                  alt="Ana"
                  className="w-8 h-8 rounded-full object-cover mt-1 shrink-0"
                  src="https://i.pravatar.cc/64?img=47"
                />
                <div className="max-w-[75%] space-y-2">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-[0_4px_24px_rgba(29,42,35,0.04)] border border-olive-light/5 font-body-md text-body-md text-on-surface">
                    <p>
                      Good morning! That&apos;s a great question. The walking
                      tour usually wraps up around 1:00 PM near Kiyomizu-dera.
                      It might be a bit tight if we try to do a formal
                      ceremony immediately after.
                    </p>
                    <p className="mt-2">
                      However, I know a wonderful, intimate tea house tucked
                      away just a few streets over that offers a slightly
                      abbreviated, yet very authentic experience. It would be
                      perfect for your schedule.
                    </p>
                  </div>
                </div>
              </div>
              {/* Specialist Override Node (Recommendation) */}
              <div className="flex justify-start gap-3">
                <div className="w-8 shrink-0" />
                <div className="max-w-[85%] w-full">
                  <div className="bg-glass-light/80 backdrop-blur-xl p-5 rounded-2xl border border-ochre-light/30 shadow-[0_8px_32px_rgba(29,42,35,0.08)] relative overflow-hidden group">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-ochre-dark text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          stars
                        </span>
                        <span className="font-mono-micro text-mono-micro text-ochre-dark uppercase tracking-wider">
                          Specialist Recommendation
                        </span>
                      </div>
                      <span className="bg-surface-container-high text-olive-dark font-mono-technical text-[10px] px-2 py-0.5 rounded-full">
                        Day 2 Update
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "url('https://picsum.photos/seed/matcha-bowl/200/200')",
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline-sm text-headline-sm text-primary mb-1">
                          En Tea House Experience
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">
                          A 45-minute casual yet authentic matcha preparation
                          and tasting, perfectly timed post-tour.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-label-ui text-olive-light">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              schedule
                            </span>
                            2:00 PM
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              payments
                            </span>
                            +$45/person
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-olive-light/10 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-ochre-light text-primary font-label-ui text-label-ui rounded-lg hover:bg-ochre-dark transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                      >
                        Add to Itinerary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-white/50 backdrop-blur-md border-t border-olive-light/10 shrink-0">
              <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white rounded-2xl p-2 shadow-sm border border-olive-light/10 focus-within:border-ochre-light/50 focus-within:ring-1 focus-within:ring-ochre-light/30 transition-all">
                <button
                  type="button"
                  aria-label="Attach"
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <textarea
                  rows={1}
                  placeholder="Reply to Ana..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 font-body-md text-body-md text-primary placeholder:text-on-surface-variant/50 max-h-32 scrollbar-hide"
                />
                <button
                  type="button"
                  aria-label="Send"
                  className="p-2 bg-primary text-white rounded-xl hover:bg-olive-dark transition-colors shrink-0 flex items-center justify-center h-10 w-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    send
                  </span>
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="font-mono-micro text-mono-micro text-on-surface-variant/40">
                  Press Enter to send, Shift + Enter for new line
                </span>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
