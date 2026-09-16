import { createFileRoute } from "@tanstack/react-router";
import { Emblem } from "@/components/eleven/Emblem";
import { ChatWithEleven } from "@/components/eleven/ChatWithEleven";

const TITLE = "Eleven — The Hero Who Hears the Unspoken";
const DESCRIPTION =
  "Eleven listens for the signal beneath the words. A quiet help portal: her story, her powers, and a conversation whenever you're ready.";

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

const NAV = [
  { href: "#story", label: "Story" },
  { href: "#powers", label: "Powers" },
  { href: "#mission", label: "Mission" },
];

const POWERS = [
  {
    no: "01",
    name: "Resonance",
    body: "She senses the emotional signal underneath the words — the weight, the hesitation, the part that was rehearsed.",
  },
  {
    no: "02",
    name: "Signal Trace",
    body: "She recognises unspoken cries for help: a cancelled plan, a message that stops halfway, a joke that lands wrong.",
  },
  {
    no: "03",
    name: "Calm Field",
    body: "A grounding presence in overwhelming moments. She lowers the volume of the room until a person can think again.",
  },
  {
    no: "04",
    name: "Echo Memory",
    body: "She remembers, so nobody has to repeat their trauma. You never have to start from the hardest part again.",
  },
];

const STEPS = [
  {
    no: "01",
    title: "Start somewhere",
    body: "Not at the beginning, not neatly. Wherever the words happen to be right now is a valid place to begin.",
  },
  {
    no: "02",
    title: "Be heard",
    body: "Eleven asks a few quiet questions, listens to what's underneath them, and doesn't rush you to a conclusion.",
  },
  {
    no: "03",
    title: "Take the next step",
    body: "One step — just the next thing that makes tomorrow slightly lighter than today.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <nav className="mx-auto flex max-w-4xl items-center gap-6 px-5 py-4" aria-label="Main">
          <a
            href="#top"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Emblem className="h-6 w-6 text-primary" />
            <span className="font-display text-sm font-medium text-foreground">Eleven</span>
          </a>
          <div className="ml-auto flex items-center gap-6">
            <ul className="hidden gap-6 text-sm text-muted-foreground sm:flex">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#talk"
              className="text-sm text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Talk to Eleven
            </a>
          </div>
        </nav>
      </header>

      <main id="top" className="mx-auto max-w-4xl px-5">
        {/* Introduction */}
        <section className="py-20 sm:py-28">
          <p className="text-sm text-muted-foreground">The hero who hears the unspoken</p>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-light leading-tight sm:text-5xl">
            Some battles are invisible.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Eleven hears the things people struggle to say. This is a quiet place to be heard — no forms, no
            performance, just a conversation whenever you're ready.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#talk"
              className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Talk to Eleven
            </a>
            <a
              href="#story"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Read her story
            </a>
          </div>
        </section>

        {/* Origin */}
        <section id="story" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
          <h2 className="font-display text-2xl font-light">Before she became Eleven</h2>
          <div className="mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              She was eleven when she first noticed it. Her mother said "I'm fine" in the kitchen, and the words arrived
              at the table with something else attached — a low hum, the sound of a person holding a door shut from the
              inside.
            </p>
            <p>
              For years she assumed everyone heard it. They didn't. Most people listen to sentences; almost nobody
              listens to the pressure behind them. She started calling it{" "}
              <span className="text-foreground">Resonance</span>: the emotional signal that travels underneath speech.
            </p>
            <p>
              She didn't want a cape or a city to defend. She wanted a quieter job: to sit with the hum until someone
              felt safe enough to name it. She kept the number she was when she first heard it.
            </p>
          </div>
        </section>

        {/* Powers */}
        <section id="powers" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
          <h2 className="font-display text-2xl font-light">Four ways of listening</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-x-12">
            {POWERS.map((p) => (
              <div key={p.no}>
                <dt className="font-display text-base text-foreground">
                  <span className="mr-2 text-muted-foreground">{p.no}</span>
                  {p.name}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Mission */}
        <section id="mission" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
          <h2 className="text-sm text-muted-foreground">Mission</h2>
          <p className="mt-5 max-w-2xl font-display text-2xl font-light leading-snug sm:text-3xl">
            Her mission isn't to save everyone. It's to make sure nobody has to face everything alone.
          </p>
        </section>

        {/* How she helps */}
        <section className="border-t border-border py-16 sm:py-20">
          <h2 className="font-display text-2xl font-light">How she helps</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.no}>
                <p className="text-sm text-muted-foreground">{s.no}</p>
                <h3 className="mt-2 font-display text-base font-normal">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Chat */}
        <section id="talk" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
          <h2 className="font-display text-2xl font-light">Talk to Eleven</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Eleven will ask a few things — your name, age, where you are, and an email so someone can reach you — then
            listen to whatever you want to say.
          </p>
          <div className="mt-8">
            <ChatWithEleven />
          </div>
          <p className="mt-6 max-w-xl text-xs leading-relaxed text-muted-foreground">
            If you're in immediate danger, please contact your local emergency services. Eleven is a listening portal,
            not a crisis line.
          </p>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
          <span className="text-foreground">Eleven</span>
          <p>The hero who hears the unspoken.</p>
          <p className="sm:ml-auto">Built for the TechAscent Machine Test.</p>
        </div>
      </footer>
    </div>
  );
}
