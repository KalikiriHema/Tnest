import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ProjectItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, Truck, Upload, AlertCircle, Star, MessageSquare, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

interface ProjectTrackerProps {
  projectId: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({ projectId, onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Shipment Form State
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentModal, setShipmentModal] = useState(false);

  // Delivery Submission State
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');

  // Revision Request State
  const [revisionModal, setRevisionModal] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  // Review Modal State
  const [reviewModal, setReviewModal] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await api.getProjectById(projectId);
      setProject(data);
    } catch {
      // Demo mock fallback
      setProject({
        id: projectId || 'mock-proj-1',
        title: 'UGC Unboxing & Routine Videos',
        clientProfileId: 'client-1',
        clientName: 'GlowSkin Organics',
        professionalProfileId: 'pro-1',
        professionalName: 'Priya Reddy',
        agreedPrice: 15000,
        currency: 'INR',
        status: 'InProgress',
        requiresShipment: true,
        courierName: 'BlueDart Express',
        trackingNumber: 'BD-882941039',
        createdAtUtc: new Date().toISOString(),
        deliveries: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.updateShipment(project.id, { courierName, trackingNumber });
      setShipmentModal(false);
      loadProject();
    } catch {
      setShipmentModal(false);
    }
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.submitDelivery(project.id, { deliveryUrls: [deliveryUrl], notes: deliveryNotes });
      setDeliveryModal(false);
      loadProject();
    } catch {
      setDeliveryModal(false);
    }
  };

  const handleApproveDelivery = async (deliveryId: string) => {
    if (!project) return;
    try {
      await api.approveDelivery(project.id, deliveryId);
      loadProject();
    } catch {}
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading agreement...</div>;
  }

  if (!project) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p>Agreement not found.</p>
        <button onClick={() => onNavigate('my-activity')} className="btn btn-secondary" style={{ marginTop: '12px' }}>
          Back to Activity
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '1000px' }}>
      
      {/* Top Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: 'Workspace', view: 'my-activity' },
          { label: project.title || 'Agreement Tracker', active: true }
        ]}
        backLabel="Back"
        onNavigate={onNavigate}
        rightElement={
          <span className="badge badge-emerald">
            <ShieldCheck size={12} /> Milestone Payment Secured (₹{project.agreedPrice.toLocaleString()})
          </span>
        }
      />

      {/* Header */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Contract Agreement</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{project.title}</h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
              <span>Client: <strong>{project.clientName}</strong></span>
              <span>•</span>
              <span>Doer: <strong>{project.professionalName}</strong></span>
              <span>•</span>
              <span>Status: <strong style={{ color: 'var(--accent-primary)' }}>{project.status}</strong></span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{project.agreedPrice.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--status-success)', fontWeight: 500 }}>
              ✓ Payment Protected
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Stages Grid */}
      <div className="grid-cols-2" style={{ gap: '20px', marginBottom: '28px' }}>
        
        {/* Physical Shipment Stage (if required) */}
        {project.requiresShipment && (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Truck size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Product Kit Shipment</h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {project.courierName 
                ? `Shipped via ${project.courierName} (Tracking: ${project.trackingNumber || 'Pending'})` 
                : 'Awaiting courier tracking info from client.'}
            </p>

            <button onClick={() => setShipmentModal(true)} className="btn btn-secondary btn-sm">
              {project.courierName ? 'Update Tracking' : 'Add Courier Tracking'}
            </button>
          </div>
        )}

        {/* Deliverables Stage */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Upload size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Deliverables Submission</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Submit finished video files, source links, or documents for client inspection.
          </p>

          <button onClick={() => setDeliveryModal(true)} className="btn btn-primary btn-sm">
            Submit Deliverables
          </button>
        </div>

      </div>

      {/* Chat Action Footer */}
      <div className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Need to discuss milestones or revisions?
        </div>
        <button onClick={() => onNavigate('messages')} className="btn btn-secondary btn-sm">
          <MessageSquare size={14} /> Open Agreement Chat
        </button>
      </div>

      {/* Shipment Modal */}
      {shipmentModal && (
        <div className="modal-overlay" onClick={() => setShipmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Courier Shipment Info</h3>
            <form onSubmit={handleUpdateShipment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Courier Name</label>
                <input type="text" className="input-field" placeholder="e.g. BlueDart, DTDC" value={courierName} onChange={(e) => setCourierName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tracking Number</label>
                <input type="text" className="input-field" placeholder="e.g. BD-8829410" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShipmentModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Tracking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Submission Modal */}
      {deliveryModal && (
        <div className="modal-overlay" onClick={() => setDeliveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Submit Deliverable</h3>
            <form onSubmit={handleSubmitDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>File URL / Cloud Link</label>
                <input type="url" className="input-field" placeholder="https://drive.google.com/..." value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes / Description</label>
                <textarea className="textarea-field" rows={3} placeholder="Describe the deliverables included..." value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setDeliveryModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
