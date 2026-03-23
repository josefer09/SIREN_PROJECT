import { useState } from 'react';
import { toast } from 'react-toastify';
import { ElementType } from '@/types';
import type { CreateSelectorPayload } from '@/types';

interface SelectorFormProps {
  pageId: string;
  onSubmit: (values: CreateSelectorPayload) => void;
  isPending: boolean;
}

export const SelectorForm = ({ pageId, onSubmit, isPending }: SelectorFormProps) => {
  const [name, setName] = useState('');
  const [elementType, setElementType] = useState<ElementType>(ElementType.INPUT);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.warning('Name is required', { toastId: 'form-validation' });
      return;
    }

    onSubmit({
      name,
      elementType,
      description: description || undefined,
      pageId,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="label">Selector Name *</label>
        <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="usernameInput" />
      </div>

      <div>
        <label className="label">Element Type *</label>
        <select className="input-field" value={elementType} onChange={(e) => setElementType(e.target.value as ElementType)}>
          {Object.values(ElementType).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Selector'}
      </button>
    </form>
  );
};
