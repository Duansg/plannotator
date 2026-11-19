import { useTranslate } from './ReviewLanguage';
import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Send, Check, X } from 'lucide-react';

type ToolbarLabelBreakpoint = 'md' | 'lg';

interface FeedbackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  shortLabel?: string;
  loadingLabel?: string;
  shortLoadingLabel?: string;
  title?: string;
  labelBreakpoint?: ToolbarLabelBreakpoint;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  label: customLabel,
  shortLabel,
  loadingLabel: customLoadingLabel,
  shortLoadingLabel,
  title: customTitle,
  labelBreakpoint = 'md',
}) => {
  const t = useTranslate();
  const label = customLabel ?? t('Send Feedback');
  const loadingLabel = customLoadingLabel ?? t('Sending...');
  const title = customTitle ?? t('Send Feedback');
  return (
    <Button
      variant="outline"
      size="xs"
      onClick={onClick}
      disabled={disabled}
      title={title}
      iconLeft={<Send className="size-3.5" />}
    >
      {shortLabel ? (
        <>
          <span className={labelBreakpoint === 'lg' ? 'hidden lg:inline xl:hidden' : 'hidden md:inline lg:hidden'}>
            {isLoading ? (shortLoadingLabel ?? loadingLabel) : shortLabel}
          </span>
          <span className={labelBreakpoint === 'lg' ? 'hidden xl:inline' : 'hidden lg:inline'}>
            {isLoading ? loadingLabel : label}
          </span>
        </>
      ) : (
        <span className={labelBreakpoint === 'lg' ? 'hidden lg:inline' : 'hidden md:inline'}>
          {isLoading ? loadingLabel : label}
        </span>
      )}
    </Button>
  );
};

export interface ApproveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  loadingLabel?: string;
  mobileLabel?: string;
  mobileLoadingLabel?: string;
  title?: string;
  /** Kept for plan mode (packages/editor AppHeader) — the softened "you have
   *  annotations" treatment. The old platform-mode `muted` prop died with
   *  PR6 (DecisionControl owns the self-approval mute now). */
  dimmed?: boolean;
  labelBreakpoint?: ToolbarLabelBreakpoint;
}

export const ApproveButton: React.FC<ApproveButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  label: customLabel,
  loadingLabel: customLoadingLabel,
  mobileLabel = 'OK',
  mobileLoadingLabel = '...',
  title,
  dimmed = false,
  labelBreakpoint = 'md',
}) => {
  const t = useTranslate();
  const label = customLabel ?? t('Approve');
  const loadingLabel = customLoadingLabel ?? t('Approving...');
  return (
    <Button
      variant="success"
      size="xs"
      onClick={onClick}
      disabled={disabled}
      title={title}
      iconLeft={<Check className="size-3.5" />}
      className={cn(
        disabled && 'bg-muted text-muted-foreground hover:bg-muted',
        dimmed && !disabled && 'bg-success/50 text-success-foreground/70 hover:bg-success hover:text-success-foreground',
      )}
    >
      <span className={labelBreakpoint === 'lg' ? 'lg:hidden' : 'md:hidden'}>
        {isLoading ? mobileLoadingLabel : mobileLabel}
      </span>
      <span className={labelBreakpoint === 'lg' ? 'hidden lg:inline' : 'hidden md:inline'}>
        {isLoading ? loadingLabel : label}
      </span>
    </Button>
  );
};

interface ExitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
  labelBreakpoint?: ToolbarLabelBreakpoint;
  /** `'ghost'` renders the icon-only ghost-X form that sits beside the
   *  decision control. Default `'pill'` keeps every existing caller
   *  byte-identical. */
  appearance?: 'pill' | 'ghost';
}

export const ExitButton: React.FC<ExitButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  title: customTitle,
  labelBreakpoint = 'md',
  appearance = 'pill',
}) => {
  const t = useTranslate();
  const title = customTitle ?? t('Close session without sending feedback');
  return appearance === 'ghost' ? (
    <Button
      variant="ghost"
      size="xs"
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      aria-label={title}
      // Maintainer ruling (post-demo): a bare X carries "close without
      // sending" semantics an unlabeled icon should not carry alone — the
      // word renders at every breakpoint.
      className="px-2 text-muted-foreground gap-1.5"
    >
      {isLoading ? '…' : (
        <>
          <X className="size-3.5" aria-hidden="true" />
          <span>{t('Close')}</span>
        </>
      )}
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="xs"
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      aria-label={title}
      className="bg-muted text-muted-foreground hover:bg-muted/80"
    >
      <span className={labelBreakpoint === 'lg' ? 'lg:hidden' : 'md:hidden'}>
        {isLoading ? '…' : <X className="size-3.5" aria-hidden="true" />}
      </span>
      <span className={labelBreakpoint === 'lg' ? 'hidden lg:inline' : 'hidden md:inline'}>{isLoading ? t('Closing...') : t('Close')}</span>
    </Button>
  );
};
