import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Emblem } from "@/components/eleven/Emblem";
import { ChatWithEleven } from "@/components/eleven/ChatWithEleven";

const TITLE = "Eleven — The Hero Who Hears the Unspoken";
const DESCRIPTION =
  "A quiet listening portal where Eleven hears the signal beneath the words and helps you take the next step.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const POWERS = [
  ["01", "Resonance", "She senses the emotional signal underneath the words — the weight, the hesitation, the part that was rehearsed."],
  ["02", "Signal Trace", "She recognises unspoken cries for help: a cancelled plan, a message that stops halfway, a joke that lands wrong."],
  ["03", "Calm Field", "A grounding presence in overwhelming moments. She lowers the volume of the room until a person can think again."],
  ["04", "Echo Memory", "She remembers, so nobody has to repeat their trauma. You never have to start from the hardest part again."],
];

const STEPS = [
  ["Step 01", "Start somewhere", "Not at the beginning, not neatly. Wherever the words happen to be is a valid place to begin."],
  ["Step 02", "Be heard", "Eleven asks a few quiet questions, listens to what is underneath them, and never rushes you."],
  ["Step 03", "Take the next step", "One step — just the next thing that makes tomorrow slightly lighter than today."],
];

function Rule() {
  return <div className="mx-auto max-w-6xl px-6 sm:px-10"><div className="h-px bg-border" /></div>;
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10" aria-label="Main navigation">
          <a href="#top" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Emblem className="h-9 w-9 text-primary" />
            <span className="font-display text-lg font-semibold text-foreground">Eleven&apos;s Signal</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#story" className="transition-colors hover:text-foreground">Story</a>
            <a href="#powers" className="transition-colors hover:text-foreground">What it does</a>
            <a href="#help" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#talk" className="font-medium text-primary underline-offset-4 hover:underline">Open a line</a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-10 sm:pt-24">
          <div className="grid gap-x-12 gap-y-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="mb-6 text-xs font-semibold uppercase text-primary">A listening portal</p>
              <h1 className="max-w-3xl text-balance font-display text-5xl font-bold leading-[1.03] text-foreground sm:text-6xl">
                ELEVEN — The Hero Who Hears the Unspoken
              </h1>
              <p className="mt-7 font-display text-2xl font-medium text-foreground/70">Some battles are invisible.</p>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                A quiet conversation that listens for what you don&apos;t say — the hesitation, the weight behind the words. No performance, no pressure. Just a signal that stays steady while you find your own.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href="#talk" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Talk to Eleven <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#story" className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary">Read the origin story</a>
              </div>
            </div>
            <div className="flex items-start md:col-span-5 md:justify-end">
              <div className="w-full max-w-xs border-l border-border py-2 pl-7">
                <div className="flex items-center gap-4">
                  <Emblem className="h-12 w-12 text-primary" />
                  <div>
                    <p className="font-display font-semibold">Now listening</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><span className="signal-dot h-2 w-2 rounded-full bg-signal" />Signal steady</p>
                  </div>
                </div>
                <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">Eleven holds a long silence when it&apos;s needed and speaks only to point you back to yourself.</p>
              </div>
            </div>
          </div>
        </section>

        <Rule />
        <section id="story" className="mx-auto grid max-w-6xl scroll-mt-20 gap-8 px-6 py-20 sm:px-10 md:grid-cols-12">
          <p className="text-xs font-semibold uppercase text-primary md:col-span-4">(a) Origin</p>
          <div className="md:col-span-8">
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">Before she became Eleven.</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>She was eleven when she first noticed it. Her mother said “I&apos;m fine” in the kitchen, and the words arrived with something else attached — the sound of a person holding a door shut from the inside.</p>
              <p>Most people listen to sentences; almost nobody listens to the pressure behind them. She called it <span className="text-foreground">Resonance</span>: the emotional signal travelling underneath speech.</p>
            </div>
          </div>
        </section>

        <Rule />
        <section id="powers" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:px-10">
          <div className="mb-12 grid gap-5 md:grid-cols-12">
            <p className="text-xs font-semibold uppercase text-primary md:col-span-4">(b) What it does</p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl md:col-span-8">Four ways of listening.</h2>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {POWERS.map(([no, name, body]) => (
              <li key={no} className="grid gap-3 py-7 sm:grid-cols-12 sm:gap-x-8">
                <span className="font-display text-lg font-semibold text-primary sm:col-span-1">{no}</span>
                <h3 className="font-display text-xl font-semibold sm:col-span-4">{name}</h3>
                <p className="leading-relaxed text-muted-foreground sm:col-span-7">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <Rule />
        <section id="mission" className="mx-auto grid max-w-6xl scroll-mt-20 gap-7 px-6 py-24 sm:px-10 md:grid-cols-12">
          <p className="text-xs font-semibold uppercase text-primary md:col-span-4">The mission</p>
          <p className="text-balance font-display text-3xl font-medium leading-tight sm:text-4xl md:col-span-8">Her mission isn&apos;t to save everyone. It&apos;s to make sure nobody has to face everything alone.</p>
        </section>

        <Rule />
        <section id="help" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:px-10">
          <div className="mb-12 grid gap-5 md:grid-cols-12">
            <p className="text-xs font-semibold uppercase text-primary md:col-span-4">(c) How it works</p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl md:col-span-8">Three gentle steps.</h2>
          </div>
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map(([no, title, body]) => (
              <li key={no}>
                <p className="text-xs font-semibold uppercase text-primary">{no}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <Rule />
        <section id="talk" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:px-10">
          <div className="mb-10 grid gap-5 md:grid-cols-12">
            <p className="text-xs font-semibold uppercase text-primary md:col-span-4">(d) Say it here</p>
            <div className="md:col-span-8">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Open a quiet line.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Eleven will ask for your name, age, location, and email before listening to what you want to share.</p>
            </div>
          </div>
          <ChatWithEleven />
          <p className="mt-5 max-w-3xl border-l-2 border-signal pl-4 text-xs leading-relaxed text-muted-foreground"><strong className="font-semibold text-foreground">Important:</strong> Eleven is a listening portal, not a crisis line or replacement for professional care. If you&apos;re in immediate danger, contact your local emergency services now.</p>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <span className="font-display font-semibold text-foreground">Eleven&apos;s Signal</span>
          <span>A quiet place to be heard.</span>
        </div>
      </footer>
    </div>
  );
}