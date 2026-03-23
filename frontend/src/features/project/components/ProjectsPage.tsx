import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Trash2, Edit, Globe } from 'lucide-react';

import { useGetProjects } from '../hooks/useGetProjects';
import { useCreateProject } from '../hooks/useCreateProject';
import { useDeleteProject } from '../hooks/useDeleteProject';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProjectForm } from './ProjectForm';

export const ProjectsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { getProjects } = useGetProjects();
  const { createMutation } = useCreateProject();
  const { deleteMutation } = useDeleteProject();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Projects</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your Cypress test projects
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {getProjects.isLoading && (
        <div className="text-center py-10 text-text-secondary">Loading...</div>
      )}

      {getProjects.data && getProjects.data.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start mapping selectors"
          action={
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Project
            </button>
          }
        />
      )}

      {getProjects.data && getProjects.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getProjects.data.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card hover:bg-card-hover transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text truncate">{project.name}</h3>
                  <div className="flex items-center gap-1 text-text-secondary text-xs mt-1">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{project.baseUrl}</span>
                  </div>
                  {project.description && (
                    <p className="text-text-muted text-sm mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Delete this project?')) {
                      deleteMutation.mutate(project.id);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Project"
      >
        <ProjectForm
          onSubmit={(values) => {
            createMutation.mutate(values, {
              onSuccess: () => setShowCreateModal(false),
            });
          }}
          isPending={createMutation.isPending}
          submitLabel="Create Project"
        />
      </Modal>
    </div>
  );
};
