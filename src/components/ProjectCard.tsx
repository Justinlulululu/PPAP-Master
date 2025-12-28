import React from 'react';
import { PPAPProjectWithManagers } from '../lib/supabase';

interface ProjectCardProps {
  project: PPAPProjectWithManagers;
  onEdit: (project: PPAPProjectWithManagers) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const statusColors = {
    draft: { bg: '#f7fafc', border: '#cbd5e0', text: '#2d3748' },
    in_progress: { bg: '#ebf8ff', border: '#4299e1', text: '#2c5282' },
    completed: { bg: '#f0fff4', border: '#48bb78', text: '#22543d' },
    on_hold: { bg: '#fffaf0', border: '#ed8936', text: '#7c2d12' },
  };

  const statusConfig = statusColors[project.status];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.projectNumber}>{project.project_number}</div>
          <h3 style={styles.projectName}>{project.project_name}</h3>
        </div>
        <div
          style={{
            ...styles.statusBadge,
            background: statusConfig.bg,
            border: `2px solid ${statusConfig.border}`,
            color: statusConfig.text,
          }}
        >
          {project.status.replace('_', ' ')}
        </div>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Progress</span>
          <span style={styles.progressValue}>{project.progress_percentage}%</span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${project.progress_percentage}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.managersSection}>
        <div style={styles.managerRow}>
          <span style={styles.managerLabel}>Sales Manager:</span>
          <span style={styles.managerName}>
            {project.sales_manager?.wechat_name || project.sales_manager?.email || 'Not assigned'}
          </span>
        </div>
        <div style={styles.managerRow}>
          <span style={styles.managerLabel}>R&D Manager:</span>
          <span style={styles.managerName}>
            {project.rd_manager?.wechat_name || project.rd_manager?.email || 'Not assigned'}
          </span>
        </div>
        <div style={styles.managerRow}>
          <span style={styles.managerLabel}>Assembly Manager:</span>
          <span style={styles.managerName}>
            {project.assembly_manager?.wechat_name || project.assembly_manager?.email || 'Not assigned'}
          </span>
        </div>
      </div>

      {(project.start_date || project.target_date) && (
        <div style={styles.datesSection}>
          {project.start_date && (
            <div style={styles.dateItem}>
              <span style={styles.dateLabel}>Start:</span>
              <span style={styles.dateValue}>{project.start_date}</span>
            </div>
          )}
          {project.target_date && (
            <div style={styles.dateItem}>
              <span style={styles.dateLabel}>Target:</span>
              <span style={styles.dateValue}>{project.target_date}</span>
            </div>
          )}
        </div>
      )}

      {project.notes && (
        <div style={styles.notesSection}>
          <div style={styles.notes}>{project.notes}</div>
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={() => onEdit(project)} style={styles.editButton}>
          Edit
        </button>
        <button onClick={() => onDelete(project.id)} style={styles.deleteButton}>
          Delete
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  projectNumber: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '600',
    marginBottom: '4px',
  },
  projectName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a202c',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  progressSection: {
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  progressLabel: {
    fontSize: '13px',
    color: '#4a5568',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: '13px',
    color: '#667eea',
    fontWeight: '700',
  },
  progressBar: {
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s',
  },
  managersSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  managerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  managerLabel: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '600',
  },
  managerName: {
    fontSize: '13px',
    color: '#2d3748',
    fontWeight: '500',
    textAlign: 'right',
  },
  datesSection: {
    display: 'flex',
    gap: '16px',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  dateItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dateLabel: {
    fontSize: '11px',
    color: '#a0aec0',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: '13px',
    color: '#2d3748',
    fontWeight: '500',
  },
  notesSection: {
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  notes: {
    fontSize: '13px',
    color: '#4a5568',
    lineHeight: '1.5',
    maxHeight: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  editButton: {
    flex: 1,
    padding: '10px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    background: '#fc8181',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
};
