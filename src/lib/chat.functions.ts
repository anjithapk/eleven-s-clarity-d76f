import { createServerFn } from "@tanstack/react-start";

export type ElevenChatTurn = { role: "user" | "assistant"; content: string };

export type ElevenChatInput = {
  visitorName: string;
  history: ElevenChatTurn[];
  /** True on the final grievance turn: the model gives a brief acknowledgment instead of a follow-up. */
  isClosing?: boolean;
};

export type ElevenChatResult = {
  reply: string;
  source: "model" | "fallback";
};

const SYSTEM_PROMPT = `You are Eleven, an original fictional superhero whose ability is called Resonance.
You are calm, observant, empathetic, warm, intelligent and natural.
Your purpose is to listen carefully to people who come to you for help.
First, genuinely respond to and validate what the visitor just said before deciding whether to ask anything.
Do not automatically end every response with a question. Ask a question only when it naturally helps the conversation move forward — often, simple acknowledgment and presence is stronger.
If the visitor's message is emotional or vulnerable, acknowledge and validate what they shared instead of immediately probing for more details.
If a follow-up question would genuinely clarify the situation, ask at most ONE natural, context-specific question.
Avoid repetitive formulaic patterns such as "That sounds difficult. What's...?" or "That must be hard. Can you tell me...?". Vary your phrasing naturally.
Remember recent conversation context and build naturally upon it.
You are not a doctor, therapist, psychologist or medical professional — never sound like a therapist, customer-support agent, intake survey or generic AI bot.
Do not diagnose mental health conditions.
Do not make medical claims.
Do not offer unsolicited advice or preach solutions. If the visitor is simply sharing, you can simply acknowledge it.
Do not make unrealistic promises.
If the visitor describes an urgent physical safety risk, prioritize a brief safety check and appropriate emergency guidance rather than continuing normal banter. For example, if they say they are stuck somewhere alone, respond like: "That sounds frightening, especially being there alone. Are you somewhere safe right now?"
Keep responses concise, one to three sentences, warm, calm and conversational.
Do not give generic motivational speeches.
Your purpose is to make the visitor feel genuinely heard while keeping the conversation natural and brief.
You are Eleven.
You are the hero who hears the unspoken.`;

const FALLBACK_REPLY = "Sorry, I lost the thread for a moment. Could you tell me that again?";
const NO_KEY_REPLY =
  "Thank you for telling me that. Take your time — can you tell me a little more about what's been happening?";

function sanitize(input: ElevenChatInput): ElevenChatInput {
  const visitorName = String(input?.visitorName ?? "").trim().slice(0, 80);
  const isClosing = input?.isClosing === true;
  const history = Array.isArray(input?.history) ? input.history : [];
  return {
    visitorName,
    isClosing,
    history: history
      .filter((t) => t && (t.role === "user" || t.role === "assistant"))
      .slice(-12)
      .map((t) => ({ role: t.role, content: String(t.content ?? "").slice(0, 4000) })),
  };
}

export const generateElevenChatResponse = createServerFn({ method: "POST" })
  .inputValidator((input: ElevenChatInput) => sanitize(input))
  .handler(async ({ data }): Promise<ElevenChatResult> => {
    const apiKey = process.env["HUGGINGFACE_API_KEY"];
    const model = process.env["HUGGINGFACE_MODEL"] ?? "meta-llama/Llama-3.1-8B-Instruct";

    if (!apiKey) {
      console.warn("[Eleven] HUGGINGFACE_API_KEY not configured — using fallback conversational response.");
      return { reply: NO_KEY_REPLY, source: "fallback" };
    }

    const contextLine = data.visitorName
      ? `Context: the visitor's name is ${data.visitorName}. Use it sparingly and naturally.`
      : "Context: the visitor has not shared a name.";

    const closingInstruction = data.isClosing
      ? "This is the FINAL message of the whole conversation. Respond with exactly ONE short, warm sentence that acknowledges what the visitor just shared. Do NOT ask any question. Do NOT offer advice, help or next steps. Then stop."
      : "";

    // Small models follow instructions best when they sit right next to the generation point:
    // append the closing directive to the visitor's last message on the final turn.
    const lastTurn = data.history[data.history.length - 1];
    const history =
      data.isClosing && lastTurn
        ? [
            ...data.history.slice(0, -1),
            {
              role: lastTurn.role,
              content:
                lastTurn.content +
                "\n\n(You are ending the conversation now. Reply with a single short, warm sentence acknowledging what was just shared. Do not ask any question. Do not offer advice or next steps.)",
            },
          ]
        : data.history;

    console.log("[Eleven Chat] Calling HF model...", { model, turns: history.length, closing: data.isClosing === true });

    try {
      const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "system", content: contextLine },
            ...history,
            ...(closingInstruction ? [{ role: "system" as const, content: closingInstruction }] : []),
          ],
          max_tokens: data.isClosing ? 60 : 160,
          temperature: data.isClosing ? 0.4 : 0.7,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("[Eleven] Hugging Face error", res.status, body.slice(0, 500));
        return { reply: FALLBACK_REPLY, source: "fallback" };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = json.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        console.error("[Eleven] Hugging Face returned an empty completion");
        return { reply: FALLBACK_REPLY, source: "fallback" };
      }

      console.log("[Eleven Chat] HF replied:", reply.slice(0, 200));
      return { reply, source: "model" };
    } catch (err) {
      const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      console.error(`[Eleven Chat] HF request ${timedOut ? "timed out" : "failed"}`, err);
      return { reply: FALLBACK_REPLY, source: "fallback" };
    }
  });
