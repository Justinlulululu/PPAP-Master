import React, { useEffect, useState } from 'react';
import { supabase, PPAPProjectWithManagers, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProjectFormProps {
  project: PPAPProjectWithManagers | null;
  onClose: () => void;
  onSave: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [formData, setFormData] = useState<{
    project_number: string;
    project_name: string;
    sales_manager_id: string;
    rd_manager_id: string;
    assembly_manager_id: string;
    status: 'draft' | 'in_progress' | 'completed' | 'on_hold';
    progress_percentage: number;
    start_date: string;
    target_date: string;
    notes: string;
  }>({
    project_number: '',
    project_name: '',
    sales_manager_id: '',
    rd_manager_id: '',
    assembly_manager_id: '',
    status: 'draft',
    progress_percentage: 0,
    start_date: '',
    target_date: '',
    notes: '',
  });

  useEffect(() => {
    loadUsers();
    if (project) {
      setFormData({
        project_number: project.project_number,
        project_name: project.project_name,
        sales_manager_id: project.sales_manager_id || '',
        rd_manager_id: project.rd_manager_id || '',
        assembly_manager_id: project.assembly_manager_id || '',
        status: project.status,
        progress_percentage: project.progress_percentage,
        start_date: project.start_date || '',
        target_date: project.target_date || '',
        notes: project.notes || '',
      });
    }
  }, [project]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('wechat_name');
    setUsers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        sales_manager_id: formData.sales_manager_id || null,
        rd_manager_id: formData.rd_manager_id || null,
        assembly_manager_id: formData.assembly_manager_id || null,
        start_date: formData.start_date || null,
        target_date: formData.target_date || null,
      };

      if (project) {
        const { error } = await supabase
          .from('ppap_projects')
          .update(dataToSave)
          .eq('id', project.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ppap_projects')
          .insert({
            ...dataToSave,
            created_by: user?.id,
          });

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      alert('Error saving project: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress_percentage' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Project Number *</label>
              <input
                type="text"
                name="project_number"
                value={formData.project_number}
                onChange={handleChange}
                style={styles.input}
                required
                disabled={!!project}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Project Name *</label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Sales Manager</label>
            <select
              name="sales_manager_id"
              value={formData.sales_manager_id}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Not assigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.wechat_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>R&D Manager</label>
            <select
              name="rd_manager_id"
              value={formData.rd_manager_id}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Not assigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.wechat_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Assembly Manager (Thailand Factory)</label>
            <select
              name="assembly_manager_id"
              value={formData.assembly_manager_id}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Not assigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.wechat_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Progress: {formData.progress_percentage}%
            </label>
            <input
              type="range"
              name="progress_percentage"
              min="0"
              max="100"
              value={formData.progress_percentage}
              onChange={handleChange}
              style={styles.slider}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Target Date</label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 1,
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#a0aec0',
    lineHeight: 1,
    padding: 0,
    width: '32px',
    height: '32px',
  },
  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  slider: {
    width: '100%',
    height: '8px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: 'white',
    color: '#4a5568',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};
