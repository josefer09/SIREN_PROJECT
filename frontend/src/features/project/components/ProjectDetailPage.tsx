import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Code,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';
import { toast } from 'react-toastify';
import JSZip from 'jszip';

import { projectApi } from '../project.api';
import { pageApi } from '@/features/page/page.api';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { useCreatePage } from '@/features/page/hooks/useCreatePage';
import { useDeletePage } from '@/features/page/hooks/useDeletePage';
import { useUpdatePage } from '@/features/page/hooks/useUpdatePage';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageForm } from '@/features/page/components/PageForm';
import { ProjectForm } from './ProjectForm';
import type { Page, UpdatePagePayload, UpdateProjectPayload } from '@/types';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getOne(id!),
    enabled: !!id,
  });

  const pagesQuery = useQuery({
    queryKey: ['pages', id],
    queryFn: () => pageApi.getByProject(id!),
    enabled: !!id,
  });

  const { updateMutation: updateProjectMutation } = useUpdateProject();
  const { createMutation } = useCreatePage();
  const { deleteMutation } = useDeletePage();
  const { updateMutation: updatePageMutation } = useUpdatePage();

  const handleExport = async () => {
    try {
      const data = await projectApi.exportProject(id!);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectQuery.data?.name || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportAllTs = async () => {
    try {
      const { files } = await projectApi.exportProjectTypescript(id!);
      if (files.length === 0) {
        toast.warning('No pages to export');
        return;
      }

      const zip = new JSZip();
      const pagesFolder = zip.folder('pages')!;
      for (const file of files) {
        pagesFolder.file(`${file.className}.ts`, file.content);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectQuery.data?.name || 'project'}-pages.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${files.length} page(s) as TypeScript POM!`);
    } catch {
      toast.error('Export failed');
    }
  };

  if (projectQuery.isLoading) {
    return <div className="text-center py-10 text-text-secondary">Loading...</div>;
  }

  const project = projectQuery.data;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/projects" className="p-2 rounded-lg hover:bg-bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display">{project?.name}</h1>
            <button
              onClick={() => setShowEditProjectModal(true)}
              className="p-1.5 rounded hover:bg-bg-secondary transition-colors text-text-muted hover:text-text"
              title="Edit project"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <p className="text-text-secondary text-sm">{project?.baseUrl}</p>
        </div>
        <button className="btn-secondary flex items-center gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          JSON
        </button>
        <button className="btn-secondary flex items-center gap-2" onClick={handleExportAllTs}>
          <Code className="w-4 h-4" />
          Export .ts
        </button>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Add Page
        </button>
      </div>

      {project?.description && (
        <p className="text-text-secondary text-sm mb-6">{project.description}</p>
      )}

      {pagesQuery.isLoading && (
        <div className="text-center py-10 text-text-secondary">Loading pages...</div>
      )}

      {pagesQuery.data && pagesQuery.data.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Add pages to start mapping selectors"
          action={
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Add Page
            </button>
          }
        />
      )}

      {pagesQuery.data && pagesQuery.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagesQuery.data.map((page) => (
            <Link
              key={page.id}
              to={`/pages/${page.id}`}
              className="card hover:bg-card-hover transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text">{page.name}</h3>
                  <p className="text-text-secondary text-sm font-mono mt-1">{page.path}</p>
                  {page.description && (
                    <p className="text-text-muted text-xs mt-2">{page.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingPage(page);
                    }}
                    className="p-1.5 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                    title="Edit page"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm('Delete this page?')) {
                        deleteMutation.mutate(page.id);
                      }
                    }}
                    className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Page"
      >
        <PageForm
          projectId={id!}
          onSubmit={(values) => {
            createMutation.mutate(values as any, {
              onSuccess: () => setShowCreateModal(false),
            });
          }}
          isPending={createMutation.isPending}
        />
      </Modal>

      {editingPage && (
        <Modal
          isOpen={!!editingPage}
          onClose={() => setEditingPage(null)}
          title="Edit Page"
        >
          <PageForm
            projectId={id!}
            initialValues={{
              name: editingPage.name,
              path: editingPage.path,
              description: editingPage.description,
            }}
            onSubmit={(values) => {
              updatePageMutation.mutate(
                { id: editingPage.id, payload: values as UpdatePagePayload },
                { onSuccess: () => setEditingPage(null) },
              );
            }}
            isPending={updatePageMutation.isPending}
          />
        </Modal>
      )}

      {project && (
        <Modal
          isOpen={showEditProjectModal}
          onClose={() => setShowEditProjectModal(false)}
          title="Edit Project"
        >
          <ProjectForm
            initialValues={{
              name: project.name,
              description: project.description || '',
              baseUrl: project.baseUrl,
              projectPath: project.projectPath || '',
              directoryStrategy: project.directoryStrategy,
            }}
            onSubmit={(values) => {
              updateProjectMutation.mutate(
                { id: id!, payload: values as UpdateProjectPayload },
                { onSuccess: () => setShowEditProjectModal(false) },
              );
            }}
            isPending={updateProjectMutation.isPending}
            submitLabel="Update Project"
          />
        </Modal>
      )}
    </div>
  );
};
