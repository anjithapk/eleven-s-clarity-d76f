import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { createSubmission, retrySubmissionNotification } from "@/lib/submissions.functions";
import { generateElevenChatResponse, type ElevenChatTurn } from "@/lib/chat.functions";
import { Emblem } from "./Emblem";
import { ListeningDots } from "./Waveform";

type Msg = { id: number; from: "eleven" | "you"; text: string };
type Step = "name" | "age" | "location" | "email" | "grievance" | "sending" | "done";

const STEP_ORDER: Step[] = ["name", "age", "location", "email", "grievance"];

// Number of model-assisted grievance exchanges before Eleven closes the conversation.
const MAX_GRIEVANCE_TURNS = 3;
const CLOSING_LINE = "Thank you for trusting me with that. You've been heard.";


const PLACEHOLDER: Record<Step, string> = {
  name: "Type your name…",
  age: "Your age",
  location: "Where are you right now?",
  email: "you@example.com",
  grievance: "Take your time. Start anywhere…",
  sending: "Sending…",
  done: "",
};

const INPUT_MODE: Record<Step, "numeric" | "email" | "text"> = {
  name: "text",
  age: "numeric",
  location: "text",
  email: "email",
  grievance: "text",
  sending: "text",
  done: "text",
};

export function ChatWithEleven() {
  const submit = useServerFn(createSubmission);
  const askEleven = useServerFn(generateElevenChatResponse);
  const retryNotification = useServerFn(retrySubmissionNotification);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [value, setValue] = useState("");
  const [started, setStarted] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [failedSubmissionId, setFailedSubmissionId] = useState<string | null>(null);
  const answers = useRef<Record<string, string>>({});
  const grievanceParts = useRef<string[]>([]);
  const aiHistory = useRef<ElevenChatTurn[]>([]);

  const nextId = useRef(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  const push = useCallback((from: Msg["from"], text: string) => {
    setMessages((m) => [...m, { id: nextId.current++, from, text }]);
  }, []);

  const elevenSays = useCallback(
    async (lines: string[]) => {
      for (const line of lines) {
        setTyping(true);
        await new Promise((r) => setTimeout(r, Math.min(1500, 420 + line.length * 14)));
        setTyping(false);
        push("eleven", line);
        await new Promise((r) => setTimeout(r, 180));
      }
    },
    [push],
  );

  // Start the conversation when the section first becomes visible.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || started) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    void elevenSays(["Before we begin, what should I call you?"]);
  }, [started, elevenSays]);

  const handleSend = async () => {
    const raw = value.trim();
    if (typing || submittingRef.current || step === "sending" || step === "done") return;

    if (step === "name" && !raw) {
      await elevenSays(["Tell me your name first."]);
      return;
    }

    if (step === "age" && (!/^\d{1,3}$/.test(raw) || Number(raw) < 1 || Number(raw) > 120)) {
      if (raw) push("you", raw);
      setValue("");
      await elevenSays(["Please enter a valid age."]);
      return;
    }
    if (step === "location" && !raw) {
      await elevenSays(["Let me know where you're writing from."]);
      return;
    }
    if (step === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      if (raw) push("you", raw);
      setValue("");
      await elevenSays(["That email doesn't look quite right."]);
      return;
    }
    if (step === "grievance" && !raw) {
      await elevenSays(["Take your time. Tell me what's been bothering you."]);
      return;
    }

    push("you", raw);
    setValue("");
    const idx = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[idx + 1];
    const name = answers.current["name"] ?? "";

    if (step === "name") {
      answers.current[step] = raw;
      await elevenSays([`Nice to meet you, ${raw}. How old are you?`]);
    } else if (step === "age") {
      answers.current[step] = raw;
      await elevenSays(["Got it. And where are you writing from?"]);
    } else if (step === "location") {
      answers.current[step] = raw;
      await elevenSays(["Thanks. If you'd like someone to get back to you, what's your email?"]);
    } else if (step === "email") {
      answers.current[step] = raw;
      await elevenSays([`Okay, ${name}. I'm listening. What's been bothering you?`]);
    }

    if (step !== "grievance") {
      setStep(next as Step);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    grievanceParts.current.push(raw);
    aiHistory.current.push({ role: "user", content: raw });
    const turns = grievanceParts.current.length;

    if (turns < MAX_GRIEVANCE_TURNS) {
      setTyping(true);
      let reply = "";
      try {
        console.log("[Eleven Chat] Calling HF model...", { turn: turns, historyLength: aiHistory.current.length });
        const res = await askEleven({ data: { visitorName: name, history: aiHistory.current } });
        reply = res.reply;
        console.log("[Eleven Chat] HF replied:", res.source, reply);
      } catch (err) {
        console.error("[Eleven Chat] HF call failed", err);
        reply = "Sorry, I lost the thread for a moment. Could you tell me that again?";
      }
      setTyping(false);
      aiHistory.current.push({ role: "assistant", content: reply });
      await elevenSays([reply]);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    // Final turn: Eleven briefly acknowledges what the visitor just said before closing.
    setTyping(true);
    let ack = "";
    try {
      console.log("[Eleven Chat] Calling HF model (closing)...", {
        turn: turns,
        historyLength: aiHistory.current.length,
      });
      const res = await askEleven({ data: { visitorName: name, history: aiHistory.current, isClosing: true } });
      if (res.source === "model") {
        ack = res.reply;
        console.log("[Eleven Chat] HF closing acknowledgment:", ack);
      }
    } catch (err) {
      console.error("[Eleven Chat] HF closing call failed", err);
    }
    setTyping(false);
    if (ack) {
      aiHistory.current.push({ role: "assistant", content: ack });
      await elevenSays([ack]);
    }

    const transcript = aiHistory.current
      .map((t) => (t.role === "user" ? `${name || "Visitor"}: ${t.content}` : `Eleven: ${t.content}`))
      .join("\n\n");
    answers.current["grievance"] = transcript;
    await elevenSays([CLOSING_LINE]);


    submittingRef.current = true;
    setStep("sending");
    setTyping(true);
    setNote(null);
    try {
      const result = await submit({
        data: {
          name: answers.current["name"] ?? "",
          age: Number(answers.current["age"] ?? 0),
          location: answers.current["location"] ?? "",
          email: answers.current["email"] ?? "",
          grievance: transcript,
        },
      });
      if (result.emailStatus === "simulated") {
        await elevenSays(["Conversation complete."]);
        setNote(
          "Your message was saved. In this local preview, the notification email is simulated because email delivery is not configured.",
        );
      } else if (result.emailStatus === "failed") {
        setTyping(false);
        setFailedSubmissionId(result.id ?? null);
        setNote("Your message was saved, but I couldn't send the notification. You can try the notification again.");
      } else {
        await elevenSays(["Conversation complete."]);
        setNote("Your message was saved, and the notification was delivered.");
      }
      setStep("done");
    } catch (err) {
      setTyping(false);
      console.error(err);
      setNote("Something got in the way of sending that. Your message is still here, so you can try again.");
      grievanceParts.current.pop();
      aiHistory.current.pop();
      setValue(raw);
      setStep("grievance");

    } finally {
      submittingRef.current = false;
    }
  };

  const handleRetryNotification = async () => {
    if (!failedSubmissionId || submittingRef.current) return;
    submittingRef.current = true;
    setTyping(true);
    setNote(null);
    try {
      const result = await retryNotification({
        data: { submissionId: failedSubmissionId, email: answers.current["email"] ?? "" },
      });
      setTyping(false);
      if (result.emailStatus === "sent") {
        setFailedSubmissionId(null);
        await elevenSays(["Conversation complete."]);
        setNote("Your message was saved, and the notification was delivered.");
      } else if (result.emailStatus === "simulated") {
        setFailedSubmissionId(null);
        await elevenSays(["Conversation complete."]);

        setNote("Your message was saved. In this local preview, the notification email is simulated because email delivery is not configured.");
      } else {
        setNote("The notification still couldn't be sent. Your message remains safely saved, and you can try again.");
      }
    } catch (err) {
      console.error(err);
      setTyping(false);
      setNote("The notification still couldn't be sent. Your message remains safely saved, and you can try again.");
    } finally {
      submittingRef.current = false;
    }
  };

  const disabled = typing || step === "sending" || step === "done";

  return (
    <div ref={sectionRef} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Emblem className="h-7 w-7 text-primary" title="Eleven" />
        <div>
          <p className="text-sm font-semibold text-foreground">Eleven · here for you</p>
          <p className="text-xs text-muted-foreground">
          {typing ? "typing…" : step === "done" ? "conversation complete" : "listening"}
          </p>
        </div>
        <span className="signal-dot ml-auto h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
      </header>

      <Conversation className="h-[min(60vh,28rem)] min-h-80 sm:h-[30rem]" aria-live="polite">
        <ConversationContent className="gap-5 px-5 py-6 sm:px-7">
        {messages.length === 0 && !typing && (
          <p className="text-sm text-muted-foreground">Eleven will start the conversation.</p>
        )}
        {messages.map((m) => (
          <Message key={m.id} from={m.from === "you" ? "user" : "assistant"}>
            <MessageContent
              className={
                m.from === "you"
                  ? "max-w-[82%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground"
                  : "max-w-[88%] px-0 py-1 text-sm leading-relaxed text-foreground sm:max-w-[78%]"
              }
            >
              <MessageResponse>{m.text}</MessageResponse>
            </MessageContent>
          </Message>
        ))}
        {typing && (
          <div className="flex items-center gap-3 text-muted-foreground" aria-label="Eleven is responding">
            <ListeningDots />
            <Shimmer className="text-xs">Listening…</Shimmer>
          </div>
        )}
        {note && (
          <div className="mt-3 border-t border-border pt-3" role="status">
            <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
            {failedSubmissionId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRetryNotification}
                disabled={typing}
                className="mt-2 min-h-11 px-0 text-primary hover:bg-transparent hover:text-primary/80"
              >
                Try notification again
              </Button>
            )}
          </div>
        )}
        </ConversationContent>
        <ConversationScrollButton aria-label="Scroll to latest message" />
      </Conversation>

      <div className="border-t border-border bg-background/50 px-4 py-4 sm:px-5">
        <PromptInput
          onSubmit={handleSend}
          className="rounded-xl border-input bg-background shadow-none transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10"
        >
          <PromptInputTextarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          inputMode={INPUT_MODE[step]}
          autoComplete={step === "name" ? "name" : step === "email" ? "email" : "off"}
          placeholder={step === "done" ? "Conversation complete." : PLACEHOLDER[step]}
          aria-label="Message Eleven"
          rows={step === "grievance" ? 3 : 1}
          className="min-h-11 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-55"
          />
          <PromptInputFooter className="justify-end px-2 pb-2">
            <PromptInputSubmit
              {...(step === "sending" ? { status: "submitted" as const } : {})}
              disabled={disabled}
              aria-label={step === "done" ? "Conversation complete" : "Send message"}
              className="size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
