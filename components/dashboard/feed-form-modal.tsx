"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { FeedFormMode, FeedFormState } from "@/lib/dashboard";

type FeedFormModalProps = {
  feedForm: FeedFormState;
  feedFormMode: FeedFormMode;
  formError: string | null;
  isOpen: boolean;
  onClose: () => void;
  onChange: (next: FeedFormState) => void;
  onSubmit: () => void;
};

export function FeedFormModal({
  feedForm,
  feedFormMode,
  formError,
  isOpen,
  onChange,
  onClose,
  onSubmit,
}: FeedFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 py-8">
      <div className="dashboard-modal app-border app-surface w-full max-w-2xl border p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">
              {feedFormMode === "create" ? "Add a feed" : "Edit feed"}
            </h2>
            <p className="app-text-secondary mt-2 text-sm leading-6">
              Phase 1 validates the feed details, stores them locally, and
              seeds starter articles so the dashboard updates immediately.
            </p>
          </div>
          <button
            aria-label="Close feed form"
            className="dashboard-icon-button"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Feed title">
            <input
              className="dashboard-form-input"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  title: event.target.value,
                })
              }
              placeholder="Smashing Magazine"
              value={feedForm.title}
            />
          </FormField>
          <FormField label="Short title">
            <input
              className="dashboard-form-input"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  shortTitle: event.target.value,
                })
              }
              placeholder="Smashing Mag"
              value={feedForm.shortTitle}
            />
          </FormField>
          <FormField className="md:col-span-2" label="Feed URL">
            <input
              className="dashboard-form-input"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  feedUrl: event.target.value,
                })
              }
              placeholder="https://example.com/feed.xml"
              value={feedForm.feedUrl}
            />
          </FormField>
          <FormField className="md:col-span-2" label="Website URL">
            <input
              className="dashboard-form-input"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  siteUrl: event.target.value,
                })
              }
              placeholder="https://example.com"
              value={feedForm.siteUrl}
            />
          </FormField>
          <FormField className="md:col-span-2" label="Description">
            <textarea
              className="dashboard-form-input min-h-28"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  description: event.target.value,
                })
              }
              placeholder="A short description of what this source covers."
              value={feedForm.description}
            />
          </FormField>
          <FormField label="Category">
            <input
              className="dashboard-form-input"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  categoryName: event.target.value,
                })
              }
              placeholder="Frontend"
              value={feedForm.categoryName}
            />
          </FormField>
          <FormField label="Category color">
            <input
              className="dashboard-form-input h-12 px-2 py-2"
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  color: event.target.value,
                })
              }
              type="color"
              value={feedForm.color}
            />
          </FormField>
          <FormField label="Badge">
            <input
              className="dashboard-form-input"
              maxLength={2}
              onChange={(event) =>
                onChange({
                  ...feedForm,
                  badge: event.target.value.toUpperCase(),
                })
              }
              placeholder="SM"
              value={feedForm.badge}
            />
          </FormField>
        </div>

        {formError ? (
          <p className="mt-4 text-sm font-medium text-red-600">{formError}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button className="secondary-cta" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-cta" onClick={onSubmit} type="button">
            {feedFormMode === "create" ? "Add feed" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

function FormField({ children, className, label }: FormFieldProps) {
  return (
    <label className={className}>
      <span className="app-text-secondary mb-2 block text-sm font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}
