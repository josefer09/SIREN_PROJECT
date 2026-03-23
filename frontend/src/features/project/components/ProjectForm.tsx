import { useState } from 'react';
import { toast } from 'react-toastify';
import { DirectoryStrategy } from '@/types';

interface ProjectFormProps {
  initialValues?: {
    name: string;
    description: string;
    baseUrl: string;
    projectPath: string;
    directoryStrategy: DirectoryStrategy;
  };
  onSubmit: (values: {
    name: string;
    description?: string;
    baseUrl: string;
    projectPath?: string;
    directoryStrategy: DirectoryStrategy;
  }) => void;
  isPending: boolean;
  submitLabel: string;
}

export const ProjectForm = ({
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
}: ProjectFormProps) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [baseUrl, setBaseUrl] = useState(initialValues?.baseUrl ?? '');
  const [projectPath, setProjectPath] = useState(initialValues?.projectPath ?? '');
  const [directoryStrategy, setDirectoryStrategy] = useState<DirectoryStrategy>(
    initialValues?.directoryStrategy ?? DirectoryStrategy.FLAT,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !baseUrl) {
      toast.warning('Name and Base URL are required', { toastId: 'form-validation' });
      return;
    }

    onSubmit({
      name,
      description: description || undefined,
      baseUrl,
      projectPath: projectPath || undefined,
      directoryStrategy,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="label">Name *</label>
        <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" />
      </div>

      <div>
        <label className="label">Base URL *</label>
        <input className="input-field" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://myapp.com" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </div>

      <div>
        <label className="label">Output Path</label>
        <input className="input-field" value={projectPath} onChange={(e) => setProjectPath(e.target.value)} placeholder="/cypress/pages" />
      </div>

      <div>
        <label className="label">Directory Strategy</label>
        <select className="input-field" value={directoryStrategy} onChange={(e) => setDirectoryStrategy(e.target.value as DirectoryStrategy)}>
          <option value={DirectoryStrategy.FLAT}>Flat</option>
          <option value={DirectoryStrategy.FEATURE_BASED}>Feature Based</option>
        </select>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};
