import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BrainCircuit,
  Crosshair,
  Download,
  Pencil,
  Plus,
  Trash2,
  Code,
  FileUp,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { pageApi } from '@/features/page/page.api';
import { projectApi } from '@/features/project/project.api';
import { useUpdatePage } from '@/features/page/hooks/useUpdatePage';
import { useGetSelectors } from '../hooks/useGetSelectors';
import { useCreateSelector } from '../hooks/useCreateSelector';
import { useDeleteSelector } from '../hooks/useDeleteSelector';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { SelectorForm } from './SelectorForm';
import { PageForm } from '@/features/page/components/PageForm';
import { STATUS_LABELS } from '../const/selector.translation';
import { STATUS_CLASSES } from '../const/selector.styles';
import type { UpdatePagePayload } from '@/types';

export const PageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const pageQuery = useQuery({
    queryKey: ['page', id],
    queryFn: () => pageApi.getOne(id!),
    enabled: !!id,
  });

  const { getSelectors } = useGetSelectors(id!);
  const { createMutation } = useCreateSelector();
  const { deleteMutation } = useDeleteSelector();
  const { updateMutation } = useUpdatePage();

  const handleExportJson = async () => {
    try {
      const data = await projectApi.exportPageJson(id!);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageQuery.data?.name || 'page'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportTs = async () => {
    try {
      const content = await projectApi.exportPageTypescript(id!);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageQuery.data?.name || 'page'}.ts`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('TypeScript POM exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleUpdateFile = () => {
    toast.info(
      'Update File is not available yet. This feature will be replaced by GitHub integration in a future release. Use the export buttons to download your files.',
      { autoClose: 6000 },
    );
  };

  const handleAiScan = () => {
    toast.info(
      'AI Scan is coming soon! This feature will analyze your selectors for fragility and suggest more robust alternatives. Stay tuned for SirenAI (v2.2).',
      { autoClose: 6000 },
    );
  };

  if (pageQuery.isLoading) {
    return <div className="text-center py-10 text-text-secondary">Loading...</div>;
  }

  const page = pageQuery.data;
  const projectId = page?.project?.id;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => projectId ? navigate(`/projects/${projectId}`) : navigate('/projects')}
          className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display">{page?.name}</h1>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 rounded hover:bg-bg-secondary transition-colors text-text-muted hover:text-text"
              title="Edit page"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <p className="text-text-secondary text-sm font-mono">{page?.path}</p>
        </div>
        <button className="btn-secondary flex items-center gap-2" onClick={handleExportJson}>
          <Download className="w-4 h-4" />
          JSON
        </button>
        <button className="btn-secondary flex items-center gap-2" onClick={handleExportTs}>
          <Code className="w-4 h-4" />
          .ts POM
        </button>
        <button className="btn-secondary flex items-center gap-2 opacity-60" onClick={handleUpdateFile}>
          <FileUp className="w-4 h-4" />
          Update File
        </button>
        <button className="btn-secondary flex items-center gap-2 opacity-60" onClick={handleAiScan}>
          <BrainCircuit className="w-4 h-4" />
          AI Scan
        </button>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Add Selector
        </button>
      </div>

      {getSelectors.isLoading && (
        <div className="text-center py-10 text-text-secondary">Loading selectors...</div>
      )}

      {getSelectors.data && getSelectors.data.length === 0 && (
        <EmptyState
          icon={Crosshair}
          title="No selectors yet"
          description="Add selectors and use the inspector to map them"
          action={
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Add Selector
            </button>
          }
        />
      )}

      {getSelectors.data && getSelectors.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-text-secondary">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Strategy</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSelectors.data.map((selector) => (
                <tr key={selector.id} className="border-b border-border/50 hover:bg-bg-secondary/50 transition-colors">
                  <td className="py-3 font-medium font-mono text-sm">{selector.name}</td>
                  <td className="py-3 text-sm text-text-secondary">{selector.elementType}</td>
                  <td className="py-3 text-sm text-text-secondary">{selector.selectorStrategy || '-'}</td>
                  <td className="py-3 text-sm font-mono text-text-secondary max-w-xs truncate">
                    {selector.selectorValue || '-'}
                  </td>
                  <td className="py-3">
                    <Badge
                      label={STATUS_LABELS[selector.status] || selector.status}
                      className={STATUS_CLASSES[selector.status] || ''}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/pages/${id}/inspect/${selector.id}`}
                        className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                        title="Open Inspector"
                      >
                        <Crosshair className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Delete this selector?')) {
                            deleteMutation.mutate(selector.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Selector"
      >
        <SelectorForm
          pageId={id!}
          onSubmit={(values) => {
            createMutation.mutate(values, {
              onSuccess: () => setShowCreateModal(false),
            });
          }}
          isPending={createMutation.isPending}
        />
      </Modal>

      {page && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Page"
        >
          <PageForm
            projectId={projectId || ''}
            initialValues={{
              name: page.name,
              path: page.path,
              description: page.description,
            }}
            onSubmit={(values) => {
              updateMutation.mutate(
                { id: id!, payload: values as UpdatePagePayload },
                { onSuccess: () => setShowEditModal(false) },
              );
            }}
            isPending={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};
