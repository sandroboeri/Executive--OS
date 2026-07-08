"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Plus, Save, Trash2 } from "lucide-react";

type CommitmentStatus = "Open" | "Waiting" | "Done";
type CommitmentPriority = "High" | "Medium" | "Low";

type Commitment = {
  id: string;
  source: string;
  title: string;
  due: string;
  priority: CommitmentPriority;
  status: CommitmentStatus;
  notes: string;
};

type ReviewStep = {
  title: string;
  question: string;
  prompts: string[];
};

const reviewSteps: ReviewStep[] = [
  {
    title: "Messages",
    question: "Have I left anyone waiting?",
    prompts: [
      "Review the last 20 iMessages and SMS conversations.",
      "Look for promises, unanswered questions, arrangements, and loose ends.",
      "Capture anything that needs a reply, action, or decision."
    ]
  },
  {
    title: "WhatsApp",
    question: "Is there any conversation I need to continue?",
    prompts: [
      "Review the last 20 WhatsApp conversations.",
      "Look for family, client, social, and practical open loops.",
      "Capture actions, follow-ups, or people who deserve a reply."
    ]
  },
  {
    title: "Voicemail",
    question: "Is my voicemail clear?",
    prompts: [
      "Open Phone.",
      "Listen to any voicemails that matter.",
      "Capture actions, then delete all voicemails."
    ]
  },
  {
    title: "Completed Reminders",
    question: "Have I cleared completed items?",
    prompts: [
      "Open Reminders.",
      "Delete completed reminders.",
      "Capture anything completed that creates a further action."
    ]
  },
  {
    title: "Reminder Lists",
    question: "Are my lists still relevant?",
    prompts: [
      "Review each reminder category.",
      "Remove stale, duplicate, or irrelevant items.",
      "Add due dates where needed."
    ]
  },
  {
    title: "Previous 7 Days",
    question: "What did the last week create?",
    prompts: [
      "Review each of the last seven calendar days.",
      "Look for promises, follow-ups, receipts, expenses, invoices, and decisions.",
      "Capture anything still open."
    ]
  },
  {
    title: "Next 21 Days",
    question: "What requires preparation?",
    prompts: [
      "Review each of the next 21 calendar days.",
      "Look for conflicts, preparation gaps, travel needs, documents, and reminders.",
      "Capture preparation blocks or follow-up tasks."
    ]
  },
  {
    title: "Email",
    question: "Which emails require a decision?",
    prompts: [
      "Review unread, flagged, and waiting-for emails.",
      "Archive or delete what is noise.",
      "Capture replies, decisions, and delegated items."
    ]
  },
  {
    title: "CRM",
    question: "Who needs to hear from me?",
    prompts: [
      "Review prospects, opportunities, invoices, and stalled leads.",
      "Capture the next action for each live opportunity.",
      "Identify anything that should be closed, chased, or scheduled."
    ]
  },
  {
    title: "LinkedIn",
    question: "Which relationships need attention?",
    prompts: [
      "Review messages, notifications, comments, invitations, and post engagement.",
      "Capture people to reply to, thank, or follow up.",
      "Identify any business development opportunities."
    ]
  },
  {
    title: "Weekly Priorities",
    question: "If I only achieved three things next week, what should they be?",
    prompts: [
      "Choose no more than three priorities.",
      "Include health, family, or personal commitments where needed.",
      "Make each priority specific enough to act on."
    ]
  },
  {
    title: "Positive Close",
    question: "What should I recognise before I move on?",
    prompts: [
      "What was my biggest win this week?",
      "Who deserves thanks or recognition from me next week?",
      "What am I looking forward to?"
    ]
  }
];

const storageKey = "executive-os-review-v0-1";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [draft, setDraft] = useState<Omit<Commitment, "id">>({
    source: reviewSteps[0].title,
    title: "",
    due: "",
    priority: "Medium",
    status: "Open",
    notes: ""
  });
  const [bigThree, setBigThree] = useState(["", "", ""]);
  const [reviewNotes, setReviewNotes] = useState("");

  const currentStep = reviewSteps[stepIndex];
  const progress = Math.round((completedSteps.length / reviewSteps.length) * 100);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setStarted(parsed.started ?? false);
      setStepIndex(parsed.stepIndex ?? 0);
      setCompletedSteps(parsed.completedSteps ?? []);
      setCommitments(parsed.commitments ?? []);
      setBigThree(parsed.bigThree ?? ["", "", ""]);
      setReviewNotes(parsed.reviewNotes ?? "");
    }
  }, []);

  useEffect(() => {
    const payload = { started, stepIndex, completedSteps, commitments, bigThree, reviewNotes };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [started, stepIndex, completedSteps, commitments, bigThree, reviewNotes]);

  useEffect(() => {
    setDraft((d) => ({ ...d, source: currentStep.title }));
  }, [currentStep.title]);

  const openCommitments = useMemo(
    () => commitments.filter((c) => c.status !== "Done"),
    [commitments]
  );

  function completeStep() {
    if (!completedSteps.includes(currentStep.title)) {
      setCompletedSteps([...completedSteps, currentStep.title]);
    }
    if (stepIndex < reviewSteps.length - 1) setStepIndex(stepIndex + 1);
  }

  function addCommitment() {
    if (!draft.title.trim()) return;
    setCommitments([
      ...commitments,
      {
        ...draft,
        id: crypto.randomUUID()
      }
    ]);
    setDraft({
      source: currentStep.title,
      title: "",
      due: "",
      priority: "Medium",
      status: "Open",
      notes: ""
    });
  }

  function resetReview() {
    setStarted(false);
    setStepIndex(0);
    setCompletedSteps([]);
    setCommitments([]);
    setBigThree(["", "", ""]);
    setReviewNotes("");
    localStorage.removeItem(storageKey);
  }

  if (!started) {
    return (
      <main className="min-h-screen px-5 py-8">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 card-shadow">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Executive OS</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Saturday Executive Review</h1>
            <p className="mt-4 text-lg text-slate-600">Review. Decide. Commit.</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Today's objective</h2>
            <p className="mt-2 text-slate-600">
              Close open loops, prepare the next 21 days, and leave with three clear priorities.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-slate-500">Review steps</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="text-2xl font-bold">35m</p>
                <p className="text-sm text-slate-500">Target time</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-slate-500">Weekly priorities</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="mt-8 w-full rounded-2xl bg-slate-950 px-6 py-4 text-lg font-semibold text-white hover:bg-slate-800"
          >
            Start Review
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl bg-white p-6 card-shadow">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Step {stepIndex + 1} of {reviewSteps.length}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950">{currentStep.title}</h1>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {progress}% complete
              </div>
            </div>
            <div className="mt-5 h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-slate-950 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <h2 className="text-2xl font-semibold text-slate-900">{currentStep.question}</h2>
            <ul className="mt-5 space-y-3">
              {currentStep.prompts.map((prompt) => (
                <li key={prompt} className="flex gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Plus className="h-5 w-5" />
              Add to Commitment Register
            </h3>
            <div className="mt-4 grid gap-3">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Action, preparation task, waiting-for item, or follow-up"
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={draft.due}
                  onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                  placeholder="Due date"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                />
                <select
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value as CommitmentPriority })}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as CommitmentStatus })}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option>Open</option>
                  <option>Waiting</option>
                  <option>Done</option>
                </select>
              </div>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Notes"
                rows={3}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
              />
              <button
                onClick={addCommitment}
                className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Add Commitment
              </button>
            </div>
          </div>

          {currentStep.title === "Weekly Priorities" && (
            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Big Three</h3>
              <div className="mt-4 grid gap-3">
                {bigThree.map((item, index) => (
                  <input
                    key={index}
                    value={item}
                    onChange={(e) => {
                      const next = [...bigThree];
                      next[index] = e.target.value;
                      setBigThree(next);
                    }}
                    placeholder={`Priority ${index + 1}`}
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep.title === "Positive Close" && (
            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Review Notes</h3>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Biggest win, someone to thank, and what you are looking forward to."
                rows={5}
                className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={completeStep}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              {stepIndex === reviewSteps.length - 1 ? "Complete Review" : "Complete Step"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-5 card-shadow">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
              <ClipboardList className="h-5 w-5" />
              Commitment Register
            </h2>
            <p className="mt-1 text-sm text-slate-500">{openCommitments.length} open or waiting</p>
            <div className="mt-4 space-y-3">
              {commitments.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No commitments captured yet.
                </p>
              )}
              {commitments.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.source} · {item.priority} · {item.status}</p>
                      {item.due && <p className="mt-1 text-xs text-slate-500">Due: {item.due}</p>}
                    </div>
                    <button
                      onClick={() => setCommitments(commitments.filter((c) => c.id !== item.id))}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Delete commitment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 card-shadow">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
              <Save className="h-5 w-5" />
              Executive Brief
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><strong>Review progress:</strong> {completedSteps.length}/{reviewSteps.length}</p>
              <p><strong>Commitments captured:</strong> {commitments.length}</p>
              <p><strong>Open / waiting:</strong> {openCommitments.length}</p>
              <div>
                <strong>Big Three:</strong>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {bigThree.filter(Boolean).length === 0 && <li className="text-slate-400">Not set yet</li>}
                  {bigThree.filter(Boolean).map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>
              {reviewNotes && (
                <div>
                  <strong>Positive close:</strong>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3">{reviewNotes}</p>
                </div>
              )}
            </div>
            <button
              onClick={resetReview}
              className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Review
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
