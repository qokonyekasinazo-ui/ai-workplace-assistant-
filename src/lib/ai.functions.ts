import { createServerFn } from "@tanstack/react-start";
import { streamText, Output } from "ai";
import { z } from "zod";
import {
  createResponsesProvider,
  responsesProviderOptions,
  toUserFacingAiError,
} from "./ai-gateway.server";

const MODEL = "openai/gpt-6-astra";

async function generateStructured<T extends z.ZodTypeAny>(
  schema: T,
  system: string,
  prompt: string,
): Promise<z.infer<T>> {
  const { lovable } = createResponsesProvider();
  try {
    const result = streamText({
      model: lovable.responses(MODEL),
      system,
      prompt,
      output: Output.object({ schema }),
      providerOptions: responsesProviderOptions,
    });
    const output = await result.output;
    if (!output) throw new Error("Empty AI response");
    return output as z.infer<T>;
  } catch (error) {
    console.error("AI generation failed", error);
    throw toUserFacingAiError(error);
  }
}

/* ---------------- Email generator ---------------- */

export const EmailTone = z.enum(["formal", "friendly", "persuasive"]);
export type EmailTone = z.infer<typeof EmailTone>;

const EmailInput = z.object({
  purpose: z.string().trim().min(5).max(4000),
  tone: EmailTone,
  recipient: z.string().trim().max(200).nullable(),
  sender: z.string().trim().max(200).nullable(),
});

const EmailOutput = z.object({
  subject: z.string(),
  body: z.string(),
});
export type EmailResult = z.infer<typeof EmailOutput>;

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const toneGuide: Record<EmailTone, string> = {
      formal:
        "Formal and professional. Polished, respectful, no slang, complete sentences, measured warmth.",
      friendly:
        "Friendly and warm but still professional. Conversational, approachable, light and human.",
      persuasive:
        "Persuasive and confident. Lead with the benefit, address likely objections, end with a clear call to action.",
    };
    return generateStructured(
      EmailOutput,
      `You are an expert workplace communication assistant. Write complete, ready-to-send professional emails tailored precisely to the user's stated purpose. Never use placeholder filler like "[insert here]" unless a detail is genuinely unknown, in which case use a short bracketed placeholder. Keep the body under 250 words unless the purpose clearly needs more. Use plain text with blank lines between paragraphs. Include a greeting and a sign-off.`,
      `Tone: ${toneGuide[data.tone]}
Recipient: ${data.recipient || "not specified"}
Sender name for sign-off: ${data.sender || "not specified (use a generic sign-off placeholder such as [Your name])"}

Email purpose and details:
${data.purpose}`,
    );
  });

/* ---------------- Meeting summarizer ---------------- */

const MeetingInput = z.object({
  notes: z.string().trim().min(20).max(20000),
});

const MeetingOutput = z.object({
  title: z.string(),
  summary: z.string(),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string().nullable(),
      deadline: z.string().nullable(),
    }),
  ),
  decisions: z.array(z.string()),
  deadlines: z.array(z.object({ item: z.string(), date: z.string() })),
  participants: z.array(z.string()),
});
export type MeetingResult = z.infer<typeof MeetingOutput>;

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    return generateStructured(
      MeetingOutput,
      `You are a meticulous meeting analyst. Read raw meeting notes and produce: a short descriptive title; a concise summary (3-6 sentences, under 150 words) capturing purpose, key discussion points and outcomes; explicit action items with owner and deadline when stated (use null when not stated, never invent people or dates); decisions that were clearly made; a list of deadlines mentioned; and the participants named. Only extract what is actually supported by the notes. If a category has nothing, return an empty array.`,
      `Meeting notes:
${data.notes}`,
    );
  });

/* ---------------- Task planner ---------------- */

const PlanInput = z.object({
  tasks: z.string().trim().min(10).max(8000),
  horizon: z.enum(["daily", "weekly"]),
  startDate: z.string().trim().max(40),
  workHours: z.string().trim().max(60).nullable(),
});

const PlanOutput = z.object({
  overview: z.string(),
  prioritized: z.array(
    z.object({
      task: z.string(),
      priority: z.enum(["critical", "high", "medium", "low"]),
      reason: z.string(),
    }),
  ),
  days: z.array(
    z.object({
      label: z.string(),
      focus: z.string(),
      blocks: z.array(
        z.object({
          time: z.string(),
          task: z.string(),
          note: z.string().nullable(),
        }),
      ),
    }),
  ),
  tips: z.array(z.string()),
});
export type PlanResult = z.infer<typeof PlanOutput>;

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    return generateStructured(
      PlanOutput,
      `You are a pragmatic productivity planner. Given a user's tasks with any priorities and deadlines, build a realistic ${data.horizon} schedule. Rank tasks by urgency (deadline proximity), importance (impact) and stated priority; explain each ranking briefly. Place tasks into concrete time blocks within the working hours, front-loading critical work, grouping similar tasks, and leaving short buffers. For a daily plan return exactly 1 day; for a weekly plan return 5 working days (Monday to Friday) unless the user indicates otherwise. Keep the overview under 80 words and give at most 3 tips. Do not invent tasks the user did not mention.`,
      `Planning start date: ${data.startDate}
Working hours: ${data.workHours || "09:00-17:00"}
Horizon: ${data.horizon}

Tasks, priorities and deadlines:
${data.tasks}`,
    );
  });
