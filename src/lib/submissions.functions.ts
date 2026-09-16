import { createServerFn } from "@tanstack/react-start";

export type SubmissionInput = {
  name: string;
  age: number;
  location: string;
  email: string;
  grievance: string;
};

export type SubmissionResult = {
  ok: boolean;
  id?: string;
  emailStatus: "sent" | "simulated" | "failed";
  message?: string;
};

export type RetryNotificationInput = {
  submissionId: string;
  email: string;
};

const NOTIFY_TO = "anjitha.p.k.2007@gmail.com";

function validate(input: SubmissionInput): SubmissionInput {
  const name = String(input?.name ?? "").trim();
  const age = Number(input?.age);
  const location = String(input?.location ?? "").trim();
  const email = String(input?.email ?? "").trim();
  const grievance = String(input?.grievance ?? "").trim();

  if (name.length < 1) throw new Error("Name is required");
  if (!Number.isFinite(age) || age < 1 || age > 120) throw new Error("Age must be a number between 1 and 120");
  if (location.length < 1) throw new Error("Location is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email is required");
  if (grievance.length < 2) throw new Error("Please share what's going on");

  return { name, age, location, email, grievance };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function emailHtml(data: SubmissionInput, submittedAt: string) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#0a0f1d;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#e8eef7">
  <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid rgba(6,182,212,.25);border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#22d3ee">Signal received</p>
    <h1 style="margin:0 0 18px;font-size:22px;font-weight:600;color:#f4f7fb">Someone Needs Your Help</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#93a4bd;width:120px">Name</td><td style="padding:8px 0">${data.name}</td></tr>
      <tr><td style="padding:8px 0;color:#93a4bd">Age</td><td style="padding:8px 0">${data.age}</td></tr>
      <tr><td style="padding:8px 0;color:#93a4bd">Location</td><td style="padding:8px 0">${data.location}</td></tr>
      <tr><td style="padding:8px 0;color:#93a4bd">Email</td><td style="padding:8px 0">${data.email}</td></tr>
      <tr><td style="padding:8px 0;color:#93a4bd">Submitted</td><td style="padding:8px 0">${formatDate(submittedAt)}</td></tr>
    </table>
    <div style="margin-top:20px;padding:16px;border-radius:12px;background:#0a0f1d;border-left:3px solid #14b8a6">
      <p style="margin:0 0 6px;color:#93a4bd;font-size:12px;text-transform:uppercase;letter-spacing:.14em">Their message</p>
      <p style="margin:0;white-space:pre-wrap;line-height:1.6">${data.grievance}</p>
    </div>
    <p style="margin:22px 0 0;font-size:12px;color:#6b7d96">Sent automatically by Eleven — The Hero Who Hears the Unspoken.</p>
  </div></body></html>`;
}

async function sendNotification(data: SubmissionInput, submittedAt: string, submissionId?: string) {
  const apiKey = process.env["RESEND_API_KEY"];

  if (!apiKey) {
    console.warn(
      "[Eleven] RESEND_API_KEY not configured — email notification simulated.",
      { to: NOTIFY_TO, subject: "🦸 Someone Needs Your Help!", submissionId },
    );
    return "simulated" as const;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env["RESEND_FROM"] ?? "Eleven <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        subject: "🦸 Someone Needs Your Help!",
        html: emailHtml(data, submittedAt),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Eleven] Resend error", res.status, body);
      return "failed" as const;
    }

    return "sent" as const;
  } catch (err) {
    console.error("[Eleven] Email send failed", err);
    return "failed" as const;
  }
}

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: SubmissionInput) => validate(input))
  .handler(async ({ data }): Promise<SubmissionResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("submissions")
      .insert({
        visitor_name: data.name,
        visitor_age: data.age,
        visitor_location: data.location,
        visitor_email: data.email,
        grievance: data.grievance,
      })
      .select("id, submitted_at")
      .single();

    if (error) throw new Error(error.message);

    const submittedAt = (row?.submitted_at as string) ?? new Date().toISOString();
    const submissionId = row?.id as string | undefined;
    const emailStatus = await sendNotification(data, submittedAt, submissionId);

    return {
      ok: true,
      ...(submissionId ? { id: submissionId } : {}),
      emailStatus,
      ...(emailStatus === "simulated"
        ? { message: "Saved. Email notification simulated (no email key configured)." }
        : emailStatus === "failed"
          ? { message: "Saved, but the email notification could not be sent." }
          : {}),
    };
  });

export const retrySubmissionNotification = createServerFn({ method: "POST" })
  .inputValidator((input: RetryNotificationInput) => {
    const submissionId = String(input?.submissionId ?? "").trim();
    const email = String(input?.email ?? "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
      throw new Error("Invalid submission");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email is required");
    return { submissionId, email };
  })
  .handler(async ({ data }): Promise<SubmissionResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("submissions")
      .select("id, visitor_name, visitor_age, visitor_location, visitor_email, grievance, submitted_at")
      .eq("id", data.submissionId)
      .eq("visitor_email", data.email)
      .single();

    if (
      error ||
      !row ||
      row.visitor_age === null ||
      row.visitor_location === null ||
      row.visitor_email === null ||
      row.submitted_at === null
    ) {
      throw new Error("Submission not found");
    }

    const emailStatus = await sendNotification(
      {
        name: row.visitor_name,
        age: row.visitor_age,
        location: row.visitor_location,
        email: row.visitor_email,
        grievance: row.grievance,
      },
      row.submitted_at,
      row.id,
    );

    return { ok: true, id: row.id, emailStatus };
  });
