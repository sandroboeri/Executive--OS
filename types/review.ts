export type CommitmentStatus = "Open" | "Waiting" | "Done";
export type CommitmentPriority = "High" | "Medium" | "Low";
export type Commitment = { id: string; source: string; title: string; due: string; priority: CommitmentPriority; status: CommitmentStatus; notes: string; };
export type ReviewStep = { id: string; title: string; decisionQuestion: string; objective: string; prompts: string[]; };
