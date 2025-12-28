import React, { useEffect, useState } from 'react';
import { supabase, PPAPProjectWithManagers } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProjectForm } from './ProjectForm';
import { ProjectCard } from './ProjectCard';

export const Dashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [projects, setProjects] = useState<PPAPProjectWithManagers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<PPAPProjectWithManagers | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ppap_projects')
      .select(`
        *,
        sales_manager:sales_manager_id(id, wechat_name, email),
        rd_manager:rd_manager_id(id, wechat_name, email),
        assembly_manager:assembly_manager_id(id, wechat_name, email),
        creator:created_by(id, wechat_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: PPAPProjectWithManagers) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleProjectSaved = () => {
    loadProjects();
    handleCloseForm();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
      .from('ppap_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert('Error deleting project: ' + error.message);
    } else {
      loadProjects();
    }
  };

  const filteredProjects = filterStatus === 'all'
    ? projects
    : projects.filter(p => p.status === filterStatus);

  const statusCounts = {
    all: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    on_hold: projects.filter(p => p.status === 'on_hold').length,
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.headerTitle}>PPAP Master</h1>
            <p style={styles.headerSubtitle}>
              Welcome, {profile?.wechat_name || profile?.email || 'User'}
            </p>
          </div>
          <button onClick={signOut} style={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <div style={styles.filterButtons}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  ...styles.filterButton,
                  ...(filterStatus === status ? styles.filterButtonActive : {}),
                }}
              >
                {status.replace('_', ' ').toUpperCase()} ({count})
              </button>
            ))}
          </div>
          <button onClick={handleCreateProject} style={styles.createButton}>
            + New Project
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No projects found</p>
            <button onClick={handleCreateProject} style={styles.createButtonLarge}>
              Create Your First Project
            </button>
          </div>
        ) : (
          <div style={styles.projectGrid}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onClose={handleCloseForm}
          onSave={handleProjectSaved}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f7fafc',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: '0 0 4px 0',
    fontSize: '28px',
    fontWeight: '700',
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.9,
  },
  signOutButton: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '8px 16px',
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  createButton: {
    padding: '10px 24px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px rgba(72, 187, 120, 0.3)',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#718096',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyText: {
    color: '#718096',
    fontSize: '18px',
    marginBottom: '24px',
  },
  createButtonLarge: {
    padding: '14px 32px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
};
