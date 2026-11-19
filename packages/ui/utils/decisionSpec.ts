/**
 * Pure state→spec mapping for the unified header decision control.
 *
 * No React or DOM — this is what keeps the state matrix testable
 * in the plain `bun test` lane and keeps "both apps and both states are data,
 * not forked components" true. `DecisionControl.tsx` renders whatever this
 * returns; the apps translate ids into handlers.
 *
 * NOT host-supported surface: like ActionMenu/ConfirmDialog, this module is
 * app-shared chrome and is deliberately absent from the README supported-import
 * list and the strict-consumer tsconfig.
 *
 * Labels, subtitles and confirm strings are the approved prototype's
 * (DESIGN_final-proposal.html `spec()`), authoritative over any older branch
 * or mock copy — except where a later maintainer ruling supersedes it: the
 * non-gate empty menu carries ONE composer ("Send a note…"), and no
 * user-facing string uses an em dash.
 */

import { english, type Translate } from './reviewLanguage';

export type DecisionActionId =
  | 'primary'              // the left segment
  | 'note-with-approval'   // "Approve with a note…" (approval flows only)
  | 'request-changes'      // "Request changes…"
  | 'note-with-feedback'   // "Send with a note…"
  | 'approve-with-notes'   // review + gate-annotate; capability-gated
  | 'discard-and-finish';  // "Done/Approve, discard n annotations…"

export type DecisionTone = 'success' | 'primary' | 'neutral' | 'destructive';

export interface DecisionPrimary {
  id: 'primary';
  label: string;            // 'Done' | 'Approve' | 'Send Feedback' | 'Post Comments'
  shortLabel?: string;      // 'Send' — the lg-breakpoint label
  mobileLabel?: string;     // compact/touch row label
  title: string;            // tooltip / aria description
  tone: Exclude<DecisionTone, 'destructive'>;
  icon?: 'check' | 'send';
  /**
   * Platform self-approval (PR6, §3.4): rendered dimmed but NOT disabled.
   * The reason surfaces through the shared Tooltip + aria-describedby (the
   * native title is deliberately dropped when muted, pinned by test), and
   * every invocation path (click, Mod+Enter, compact row) is a no-op. The
   * caret stays live so the menu's non-approve paths remain reachable.
   */
  muted?: boolean;
}

export interface DecisionComposer {
  title: string;            // popover back-button title, e.g. 'Send with a note'
  actionLabel: string;      // the composer's own button, e.g. 'Send feedback with note'
  tone: Exclude<DecisionTone, 'destructive'>;
  icon?: 'check' | 'send';
  placeholder: string;      // 'Add a note...'
}

export interface DecisionConfirm {
  title: string;
  message: string;
  confirmText: string;
}

export interface DecisionMenuItem {
  id: Exclude<DecisionActionId, 'primary'>;
  label: string;
  subtitle: string;
  tone: DecisionTone;
  icon?: 'check' | 'send';
  dividerBefore?: boolean;
  composer?: DecisionComposer;   // present ⇒ the item morphs the popover
  confirm?: DecisionConfirm;     // present ⇒ the item raises one confirm
  /**
   * Platform self-approval (PR6, §3.4): the row renders disabled with the
   * reason in its subtitle. Muted rather than removed, so the menu still
   * documents the path and no state is a dead end (the non-approve rows
   * stay live).
   */
  muted?: boolean;
}

export interface DecisionSpec {
  primary: DecisionPrimary;
  items: DecisionMenuItem[];
}

export interface DecisionSpecInput {
  app: 'annotate' | 'review' | 'plan';
  /** Annotate: `gate`. Review and plan: ignored — their primary decision IS approval. */
  gate: boolean;
  /** The annotation count interpolated into the menu's discard and note copy (never the primary label). */
  count: number;
  /**
   * Whether there is anything to send. Deliberately separate from `count`:
   * annotate counts direct edits / saved-file changes / attachments as
   * feedback with count 0 (`hasFeedbackContent` in the annotate app).
   */
  hasFeedback: boolean;
  /** Does the runtime deliver feedback on approve? Gates every approve-carrying item. */
  approvalNotesSupported: boolean;
  /**
   * M1 ruling: the session's feedback was already delivered through the
   * annotate agent terminal, which is why `hasFeedback` reads false. The
   * empty-flip state keeps its `Done` primary AND its transport (the outer
   * agent's stdout consumer may never have seen the terminal delivery, so
   * the full payload still posts) — only the copy changes, because "reviewed
   * with no feedback" would be a lie in that state. Copy is free prose,
   * NOT frozen.
   */
  feedbackDelivered?: boolean;
  /**
   * PR6 (§3.4): presence selects the platform (PR/MR destination) arm — the
   * same DecisionSpec shape with NO composer and NO confirm items, ever:
   * every platform action opens the existing ReviewSubmissionDialog, whose
   * own general-comment textarea is the only note field on that side (a
   * second composer would double-post via buildFileScopedBody).
   * `approvalNotesSupported` is deliberately ignored by this arm — the
   * platform posts to the forge API natively — so approve-carrying items
   * gate only on `selfAuthored`, muted rather than removed.
   */
  platform?: DecisionPlatformInput;
  /**
   * #1057: the plan-review arm's extra facts (only read when `app` is
   * `'plan'`). Absent means no answers, no edits, no agent switch.
   */
  plan?: DecisionPlanInput;
}

/**
 * Plan review (#1057). Plan approval is the same decision as review's, with
 * three plan-only facts: `:::question` answers (an answers-only deny reads as
 * answers, not as a rejection), direct edits (they ride the deny and, where
 * supported, the approval), and the agent an OpenCode approval hands off to.
 */
export interface DecisionPlanInput {
  /** How many of `count` are answers to the plan's questions. */
  answers: number;
  /** Direct edits ride the feedback (they are not in `count`). */
  directEdits: boolean;
  /** The only feedback is answers: the primary reads "Send answers". */
  answersOnly: boolean;
  /** Named where notes on approval would be lost ("Claude Code"). */
  agentName: string;
  /** OpenCode: the agent approval switches to, shown as "Approve → build". */
  approveTarget?: string;
  /**
   * The only feedback is file changes the reviewer already saved to disk
   * (Edit Mode on a source-backed document). Approving drops nothing, the
   * agent just isn't told, so the approve-away row says that instead of
   * "discard". The value is the confirm's sentence ("Your saved file change
   * is already on disk. The agent won't be told about it.").
   */
  savedFilesOnly?: string;
}

export interface DecisionPlatformInput {
  /** Platform display name ('GitHub' / 'GitLab') — named in the self-approval tooltip. */
  label: string;
  /** The PR/MR noun ('PR' / 'MR') the short mute reason uses. */
  mrLabel: string;
  /** The viewer authored this PR/MR: approve paths mute, never disappear. */
  selfAuthored: boolean;
  /**
   * #1611: whether the platform has a real request-changes decision. `false`
   * makes the request-changes rows say they post as a comment. Absent keeps
   * the original copy, so a host that never sets it renders exactly what it
   * rendered before. When supported, a self-authored PR mutes Request changes
   * too and adds a live "Comment…" row so the empty state is never a dead end.
   */
  requestChangesSupported?: boolean;
  /**
   * `false` keeps Request changes live on a self-authored PR (GitLab accepts
   * it from the author). Absent follows `selfAuthored`.
   */
  selfRequestChangesBlocked?: boolean;
}

export const DECISION_NOTE_PLACEHOLDER = 'Add a note...';

export function annotationCountLabel(count: number, t: Translate): string {
  return t(count === 1 ? '{count} annotation' : '{count} annotations', { count });
}

/**
 * The empty state: no feedback to send, the primary is the positive finish.
 * `approvalFlow` (gate annotate, or review) makes it `Approve`; plain annotate
 * gets `Done`.
 */
function buildEmptySpec(input: DecisionSpecInput, approvalFlow: boolean, t: Translate): DecisionSpec {
  // "Approve with a note…" carries a note on the approve channel, which four
  // runtimes still discard — it renders only where the advert says delivery
  // works (never an item that silently drops content). Non-gate annotate has
  // no approve channel and no positive-note item at all: the maintainer ruled
  // the old "Done with a note…" / "Request changes…" pair collapsed into the
  // single "Send a note…" below, because their only difference was framing on
  // the same /api/feedback transport.
  const positive: DecisionMenuItem | null = approvalFlow && input.approvalNotesSupported
    ? {
        id: 'note-with-approval',
        label: t('Approve with a note…'),
        subtitle: t('Approve and send a short note with it'),
        tone: 'success',
        icon: 'check',
        composer: {
          title: t('Approve with a note'),
          actionLabel: t('Approve and send note'),
          tone: 'success',
          icon: 'check',
          placeholder: t(DECISION_NOTE_PLACEHOLDER),
        },
      }
    : null;

  const requestChanges: DecisionMenuItem = approvalFlow
    ? {
        id: 'request-changes',
        // Frozen copy (maintainer-approved): 'Request changes…'.
        label: t('Request changes…'),
        subtitle: t('Write overall feedback, sent as a change request'),
        tone: 'primary',
        icon: 'send',
        dividerBefore: positive !== null,
        composer: {
          title: t('Request changes'),
          actionLabel: t('Send as feedback'),
          tone: 'primary',
          icon: 'send',
          placeholder: t(DECISION_NOTE_PLACEHOLDER),
        },
      }
    : {
        // Maintainer ruling (empty-menu collapse): the one non-gate composer.
        // Same id and route as the old change request (plain /api/feedback,
        // no approval framing) — only the copy is new. Free prose, NOT frozen.
        id: 'request-changes',
        label: t('Send a note…'),
        subtitle: t('Write a note and send it as feedback'),
        tone: 'primary',
        icon: 'send',
        dividerBefore: false,
        composer: {
          title: t('Send a note'),
          actionLabel: t('Send as feedback'),
          tone: 'primary',
          icon: 'send',
          placeholder: t(DECISION_NOTE_PLACEHOLDER),
        },
      };

  return {
    primary: approvalFlow
      ? {
          id: 'primary',
          // Frozen copy (maintainer-approved): 'Approve'.
          label: t('Approve'),
          title: t('Approve: no changes requested'),
          tone: 'success',
          icon: 'check',
        }
      : {
          id: 'primary',
          // Frozen copy (maintainer-approved): 'Done'.
          label: t('Done'),
          // M1 ruling: in the agent-terminal delivered state the transport is
          // unchanged (the full payload still posts, because the outer agent
          // on stdout may never have seen the terminal delivery), so the
          // tooltip must not claim "no feedback". Free prose, NOT frozen.
          title: input.feedbackDelivered
            ? t('Finish: sends the session record (feedback already shared in the terminal)')
            : t('Finish: records that you reviewed with no feedback'),
          // Maintainer ruling (post-demo): Done without a gate is a positive
          // finish, NOT an approval — no success tone, no check icon, so it
          // can never be mistaken for the gate/review Approve.
          tone: 'neutral',
        },
    items: positive ? [positive, requestChanges] : [requestChanges],
  };
}

/**
 * The feedback state: something to send, the primary is `Send Feedback`.
 * Identical across apps; only the discard item's verb follows the flow.
 */
function buildFeedbackSpec(input: DecisionSpecInput, approvalFlow: boolean, t: Translate): DecisionSpec {
  const { count } = input;
  const feedback = annotationCountLabel(count, t);

  const items: DecisionMenuItem[] = [
    {
      id: 'note-with-feedback',
      label: t('Send with a note…'),
      subtitle:
        count > 0
          ? t('Add an overall note on top of your {feedback}', { feedback })
          : t('Add an overall note on top of your feedback'),
      tone: 'primary',
      icon: 'send',
      composer: {
        title: t('Send with a note'),
        actionLabel: t('Send feedback with note'),
        tone: 'primary',
        icon: 'send',
        placeholder: t(DECISION_NOTE_PLACEHOLDER),
      },
    },
  ];

  // The divider separates "send" alternates from "approve away" alternates —
  // it sits before whichever approve-flavoured item comes first.
  let dividerPending = true;

  // Capability-gated only (F2 ruling, maintainer-confirmed): at count 0 the feedback is direct edits / saved-file
  // changes / attachments, and a capable approve transport delivers those too,
  // so the item stays offered with zero-form copy — no "0 annotations"
  // language. Subtitles are free prose, NOT frozen.
  if (approvalFlow && input.approvalNotesSupported) {
    items.push({
      id: 'approve-with-notes',
      // Frozen copy (maintainer-approved): 'Approve with notes'.
      label: t('Approve with notes'),
      subtitle:
        count > 0
          ? t('Approve; your {feedback} ride along as non-blocking guidance', { feedback })
          : t('Approve; your edits and attachments ride along as non-blocking guidance'),
      tone: 'success',
      icon: 'check',
      dividerBefore: dividerPending,
    });
    dividerPending = false;
  }

  // Destructive by definition — it throws the annotations away — so it always
  // carries the one confirm the new model keeps. With count 0 there is nothing
  // to discard and the item is omitted.
  if (count > 0) {
    items.push({
      id: 'discard-and-finish',
      label: approvalFlow
        ? t('Approve, discard {feedback}…', { feedback })
        : t('Done, discard {feedback}…', { feedback }),
      subtitle: t('Asks to confirm: the annotations are not sent'),
      tone: 'destructive',
      icon: 'check',
      dividerBefore: dividerPending,
      // L5: neutral wording — the count can include findings from other
      // tools, and the non-gate record still carries any direct edits.
      // Free prose, NOT frozen.
      confirm: approvalFlow
        ? {
            title: t('Discard {feedback} and approve?', { feedback }),
            message:
              t('These annotations are change requests, including any from other tools. Approving without them tells the agent no changes are needed.'),
            // Frozen copy (maintainer-approved): 'Discard & approve'.
            confirmText: t('Discard & approve'),
          }
        : {
            title: t('Discard {feedback} and finish?', { feedback }),
            message:
              t('These annotations are change requests, including any from other tools. Finishing without them sends a positive review record; any direct edits still ride along.'),
            // Frozen copy (maintainer-approved): 'Discard & finish'.
            confirmText: t('Discard & finish'),
          },
    });
  }

  return {
    primary: {
      id: 'primary',
      // Frozen copy (maintainer-approved): 'Send Feedback'.
      label: t('Send Feedback'),
      shortLabel: t('Send'),
      mobileLabel: t('Send feedback'),
      title: t('Send your feedback to the agent'),
      tone: 'primary',
      icon: 'send',
    },
    items,
  };
}

/**
 * The platform (PR) arm — PR6, §3.4, per the approved DESIGN_header-pr-mode
 * mock. Reuses the agent ids so the handler Record stays closed, but every
 * item is composer-less and confirm-less: labels tell the reviewer which mode
 * the ReviewSubmissionDialog opens in, nothing more. `discard-and-finish` is
 * never emitted — the dialog owns what happens to unsent annotations.
 */
function buildPlatformSpec(input: DecisionSpecInput, platform: DecisionPlatformInput, t: Translate): DecisionSpec {
  const { selfAuthored } = platform;
  const noun = platform.mrLabel === 'MR' ? t('merge request') : t('pull request');
  // Frozen copy (maintainer-approved): the self-approval mute reason.
  const selfReason = t("You can't approve your own {request} on {platform}.", { request: noun, platform: platform.label });
  const selfReasonShort = t("You can't approve your own {request}", { request: platform.mrLabel });
  const requestChangesUnsupported = platform.requestChangesSupported === false;
  // GitHub refuses REQUEST_CHANGES on your own PR, exactly like APPROVE.
  const requestChangesMuted = selfAuthored
    && platform.requestChangesSupported === true
    && platform.selfRequestChangesBlocked !== false;
  const selfRequestChangesShort = t("You can't request changes on your own {request}", { request: platform.mrLabel });
  const postsAsComment = t('Posts as a comment; {platform} has no request-changes review', { platform: platform.label });

  if (!input.hasFeedback) {
    return {
      primary: {
        id: 'primary',
        // Frozen copy (maintainer-approved): 'Approve'.
        label: t('Approve'),
        title: selfAuthored ? selfReason : t('Approve: no changes needed'),
        tone: 'success',
        icon: 'check',
        ...(selfAuthored ? { muted: true } : {}),
      },
      items: [
        {
          id: 'note-with-approval',
          // Approved design (PR6 detail confirmed): the empty-state platform
          // menu is "Approve with a comment…" + "Request changes…".
          label: t('Approve with a comment…'),
          subtitle: selfAuthored
            ? selfReasonShort
            : t('Opens the submission dialog; the comment rides the review body'),
          tone: 'success',
          icon: 'check',
          ...(selfAuthored ? { muted: true } : {}),
        },
        {
          id: 'request-changes',
          // Frozen copy (maintainer-approved): 'Request changes…'.
          label: t('Request changes…'),
          subtitle: requestChangesMuted
            ? selfRequestChangesShort
            : requestChangesUnsupported
              ? postsAsComment
              : t('Overall feedback, zero line comments, via the dialog'),
          tone: 'primary',
          icon: 'send',
          dividerBefore: true,
          ...(requestChangesMuted ? { muted: true } : {}),
        },
        // With Request changes muted on your own PR, a neutral comment is the
        // live path (the empty state is never a dead end).
        ...(requestChangesMuted
          ? [{
              id: 'note-with-feedback' as const,
              label: t('Comment…'),
              subtitle: t('Overall feedback as a neutral comment, via the dialog'),
              tone: 'primary' as const,
              icon: 'send' as const,
            }]
          : []),
      ],
    };
  }

  return {
    primary: {
      id: 'primary',
      // Frozen copy (maintainer-approved): 'Post Comments'.
      label: t('Post Comments'),
      shortLabel: t('Post'),
      mobileLabel: t('Post comments'),
      title: t('Post review to {platform}', { platform: platform.label }),
      tone: 'primary',
      icon: 'send',
    },
    items: [
      {
        id: 'approve-with-notes',
        label: t('Approve with comments…'),
        subtitle: selfAuthored ? selfReasonShort : t('Submission dialog in approve mode'),
        tone: 'success',
        icon: 'check',
        ...(selfAuthored ? { muted: true } : {}),
      },
      {
        id: 'note-with-feedback',
        label: t('Post comments, then…'),
        subtitle: requestChangesUnsupported
          ? postsAsComment
          : requestChangesMuted
            ? t("Posts as a neutral comment; you can't request changes on your own {request}", { request: platform.mrLabel })
            : t('Request changes or stay neutral, chosen in the dialog'),
        tone: 'primary',
        icon: 'send',
        dividerBefore: true,
      },
    ],
  };
}

/** Frozen label (owner-approved mock): the plan primary when only answers are ready. */
const SEND_ANSWERS = 'Send answers';
/** The longest agent name the Approve primary carries before it is cut. */
const APPROVE_TARGET_MAX = 24;

function approveTargetSuffix(target: string | undefined): string {
  const name = target?.trim();
  if (!name) return '';
  const cut = name.length > APPROVE_TARGET_MAX ? `${name.slice(0, APPROVE_TARGET_MAX - 1)}…` : name;
  return ` → ${cut}`;
}

/**
 * What the plan feedback is, in the reviewer's words: `2 answers`,
 * `3 annotations`, `1 answer and 2 annotations`, `direct edits`. Mirrors the
 * editor's describeFeedbackLoss so the menu and the close warnings agree;
 * duplicated here because this module imports nothing.
 */
function planFeedbackPhrase(count: number, plan: DecisionPlanInput, t: Translate): { text: string; plural: boolean } {
  const answers = Math.min(Math.max(plan.answers, 0), Math.max(count, 0));
  const others = Math.max(count, 0) - answers;
  const parts = [
    answers > 0 ? t(answers === 1 ? '{count} answer' : '{count} answers', { count: answers }) : '',
    others > 0 ? annotationCountLabel(others, t) : '',
    plan.directEdits ? t('direct edits') : '',
  ].filter(Boolean);
  if (parts.length === 0) return { text: t('feedback'), plural: false };
  const text = parts.length === 1
    ? parts[0]
    : t('{first} and {last}', { first: parts.slice(0, -1).join(t(', ')), last: parts[parts.length - 1] });
  return { text, plural: parts.length > 1 || answers + others > 1 || plan.directEdits };
}

/**
 * The plan arm (#1057, approved proposal "plan-review-decision-control").
 * Empty: the approval-flow empty spec (Approve; "Approve with a note…" where
 * the host takes notes on approval; "Request changes…"), the Approve label
 * naming OpenCode's hand-off agent. Feedback: Send Feedback, or Send answers
 * for answers only; then the approve-away alternates, each saying what
 * happens to the feedback on THIS host: "Approve with notes" only where the
 * server advertises delivery, and "Approve, discard …" always (its subtitle
 * and confirm name the agent when that is the only way to approve).
 */
function buildPlanSpec(input: DecisionSpecInput, t: Translate): DecisionSpec {
  const plan: DecisionPlanInput = input.plan ?? {
    answers: 0,
    directEdits: false,
    answersOnly: false,
    agentName: t('The agent'),
  };
  const target = approveTargetSuffix(plan.approveTarget);

  if (!input.hasFeedback) {
    const empty = buildEmptySpec(input, true, t);
    return {
      primary: target ? { ...empty.primary, label: `${empty.primary.label}${target}` } : empty.primary,
      items: empty.items,
    };
  }

  const { text: what, plural } = planFeedbackPhrase(input.count, plan, t);
  const sendLabel = plan.answersOnly ? t(SEND_ANSWERS) : t('Send Feedback');
  const items: DecisionMenuItem[] = [
    {
      id: 'note-with-feedback',
      label: plan.answersOnly ? t('Send answers with a note…') : t('Send with a note…'),
      subtitle: t('Add an overall note on top of your {feedback}', { feedback: what }),
      tone: 'primary',
      icon: 'send',
      composer: {
        title: t('Send with a note'),
        actionLabel: plan.answersOnly ? t('Send answers with note') : t('Send feedback with note'),
        tone: 'primary',
        icon: 'send',
        placeholder: t(DECISION_NOTE_PLACEHOLDER),
      },
    },
  ];

  if (input.approvalNotesSupported) {
    items.push({
      id: 'approve-with-notes',
      // Frozen copy (maintainer-approved): 'Approve with notes'.
      label: t('Approve with notes') + target,
      subtitle: t(plural ? 'Approve; your {feedback} ride along as non-blocking guidance' : 'Approve; your {feedback} rides along as non-blocking guidance', { feedback: what }),
      tone: 'success',
      icon: 'check',
      dividerBefore: true,
    });
  }

  if (plan.savedFilesOnly) {
    // Nothing is lost on approval: the changes stay on disk. Same confirm
    // (one click away from a plain Approve would hide that the agent is not
    // told), different words.
    items.push({
      id: 'discard-and-finish',
      label: t('Approve without telling the agent…'),
      subtitle: t("Already on disk; the agent isn't told. Asks to confirm"),
      tone: 'destructive',
      icon: 'check',
      dividerBefore: !input.approvalNotesSupported,
      confirm: {
        title: t('Approve without telling the agent?'),
        message: plan.savedFilesOnly,
        // Frozen copy (maintainer-approved): 'Discard & approve' is the
        // discard confirm's; this one discards nothing.
        confirmText: t('Approve'),
      },
    });
  } else items.push({
    id: 'discard-and-finish',
    label: t('Approve, discard {feedback}…', { feedback: what }),
    subtitle: input.approvalNotesSupported
      ? t('Asks to confirm: nothing is sent')
      : t("{agent} can't take notes on approval; asks to confirm", { agent: plan.agentName }),
    tone: 'destructive',
    icon: 'check',
    dividerBefore: !input.approvalNotesSupported,
    confirm: {
      title: t('Discard {feedback} and approve?', { feedback: what }),
      message: input.approvalNotesSupported
        ? t(plural ? 'Approving without them tells the agent no changes are needed.' : 'Approving without it tells the agent no changes are needed.')
        : t(plural
            ? "{agent} doesn't take feedback on approval, so your {feedback} would be lost. To send them, use {send}."
            : "{agent} doesn't take feedback on approval, so your {feedback} would be lost. To send it, use {send}.",
          { agent: plan.agentName, feedback: what, send: sendLabel }),
      // Frozen copy (maintainer-approved): 'Discard & approve'.
      confirmText: t('Discard & approve'),
    },
  });

  return {
    primary: plan.answersOnly
      ? {
          id: 'primary',
          // Frozen copy (owner-approved mock): 'Send answers'.
          label: t(SEND_ANSWERS),
          mobileLabel: t(SEND_ANSWERS),
          title: t('Send your answers to the agent'),
          tone: 'primary',
          icon: 'send',
        }
      : {
          id: 'primary',
          // Frozen copy (maintainer-approved): 'Send Feedback'.
          label: t('Send Feedback'),
          shortLabel: t('Send'),
          mobileLabel: t('Send feedback'),
          title: t('Send your feedback to the agent'),
          tone: 'primary',
          icon: 'send',
        },
    items,
  };
}

export function buildDecisionSpec(input: DecisionSpecInput, t: Translate = english): DecisionSpec {
  // PR6 (§3.4): the platform destination maps onto the same spec shape with
  // no composer items; presence of the arm selects it outright.
  if (input.platform) return buildPlatformSpec(input, input.platform, t);
  if (input.app === 'plan') return buildPlanSpec(input, t);
  // Review's primary positive decision IS approval, gate flag or not.
  const approvalFlow = input.app === 'review' || input.gate;
  return input.hasFeedback
    ? buildFeedbackSpec(input, approvalFlow, t)
    : buildEmptySpec(input, approvalFlow, t);
}
