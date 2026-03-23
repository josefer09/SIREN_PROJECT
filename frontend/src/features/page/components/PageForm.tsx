import { useState } from 'react';
import { toast } from 'react-toastify';
import type { CreatePagePayload, UpdatePagePayload } from '@/types';

interface PageFormProps {
  projectId: string;
  initialValues?: { name: string; path: string; description: string | null };
  onSubmit: (values: CreatePagePayload | UpdatePagePayload) => void;
  isPending: boolean;
  submitLabel?: string;
}

export const PageForm = ({
  projectId,
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
}: PageFormProps) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [path, setPath] = useState(initialValues?.path ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');

  const isEdit = !!initialValues;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !path) {
      toast.warning('Name and Path are required', { toastId: 'form-validation' });
      return;
    }

    if (isEdit) {
      onSubmit({ name, path, description: description || undefined } as UpdatePagePayload);
    } else {
      onSubmit({ name, path, description: description || undefined, projectId } as CreatePagePayload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="label">Page Name *</label>
        <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="LoginPage" />
      </div>

      <div>
        <label className="label">Path *</label>
        <input className="input-field" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/login" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? 'Saving...' : (submitLabel ?? (isEdit ? 'Update Page' : 'Create Page'))}
      </button>
    </form>
  );
};
