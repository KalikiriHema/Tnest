import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ProjectItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, Truck, Upload, AlertCircle, Star, MessageSquare, ShieldCheck, ArrowRight, RefreshCw, Send, Check } from 'lucide-react';

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
  const [commRating, setCommRating] = useState(5);
  const [qualRating, setQualRating] = useState(5);
  const [timeRating, setTimeRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await api.getProjectById(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isClient = user?.role === 'Client';
  const isPro = user?.role === 'Professional';

  // Handler: Update Shipment info
  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.updateShipment(project.id, { courierName, trackingNumber });
      setShipmentModal(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Error updating shipment');
    }
  };

  // Handler: Confirm product received
  const handleConfirmProductReceived = async () => {
    if (!project) return;
    try {
      await api.confirmProductReceived(project.id);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Error confirming receipt');
    }
  };

  // Handler: Submit Deliverable (Pro)
  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.submitDelivery(project.id, {
        notes: deliveryNotes,
        deliveryUrls: [deliveryUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4']
      });
      setDeliveryModal(false);
      setDeliveryNotes('');
      setDeliveryUrl('');
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Error submitting delivery');
    }
  };

  // Handler: Request Revision (Client)
  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedDeliveryId) return;
    try {
      await api.requestRevision(project.id, selectedDeliveryId, revisionFeedback);
      setRevisionModal(false);
      setRevisionFeedback('');
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Error requesting revision');
    }
  };

  // Handler: Approve Delivery (Client)
  const handleApproveDelivery = async (deliveryId: string) => {
    if (!project) return;
    if (!confirm('Are you sure you want to approve this delivery and complete the milestone?')) return;
    try {
      await api.approveDelivery(project.id, deliveryId);
      loadProject();
      setReviewModal(true); // Gated review modal opens upon completion!
    } catch (err: any) {
      alert(err.message || 'Error approving delivery');
    }
  };

  // Handler: Submit Gated Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.submitReview(project.id, {
        overallRating,
        communicationRating: commRating,
        qualityRating: qualRating,
        timelinessRating: timeRating,
        comment: reviewComment
      });
      setReviewModal(false);
      alert('🌟 Verified review submitted successfully!');
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Error submitting review');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading project tracker...</div>;
  }

  if (!project) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>Project not found.</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1100px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`badge ${project.status === 'Completed' ? 'badge-emerald' : project.status === 'UnderReview' ? 'badge-amber' : 'badge-indigo'}`}>
                Status: {project.status}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Agreement ID: #{project.id.slice(0, 8)}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>{project.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Client: <strong>{project.clientCompany || project.clientName}</strong> • Creative Pro: <strong>{project.professionalName}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              ₹{project.agreedPrice.toLocaleString()} {project.currency}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target Deadline: {project.deadlineUtc ? new Date(project.deadlineUtc).toLocaleDateString() : 'Flexible'}
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '28px' }}>
          {[
            { step: 'Agreement Active', active: true, done: true },
            { step: project.requiresShipment ? 'Product Shipped & Received' : 'Production In Progress', active: true, done: project.requiresShipment ? !!project.productReceivedAtUtc : true },
            { step: 'Deliverable Under Review', active: project.deliveries.length > 0, done: project.status === 'Completed' },
            { step: 'Approved & Verified Review', active: project.status === 'Completed', done: !!project.review }
          ].map((m, idx) => (
            <div 
              key={idx}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: m.done ? 'rgba(16, 185, 129, 0.15)' : m.active ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${m.done ? 'var(--accent-emerald)' : m.active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {m.done ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Clock size={16} color="var(--accent-primary)" />}
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: m.done || m.active ? '#fff' : 'var(--text-muted)' }}>
                {m.step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
        
        {/* Left Column: Deliverables & Revisions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Deliverables Section */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Project Deliverables & Assets</h2>
              {isPro && project.status !== 'Completed' && (
                <button 
                  onClick={() => setDeliveryModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Upload size={14} /> Submit New Deliverable / Cut
                </button>
              )}
            </div>

            {project.deliveries.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                No assets uploaded yet. The creative professional will submit drafts here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {project.deliveries.map((del) => {
                  let urls: string[] = [];
                  try { urls = JSON.parse(del.deliveryUrlsJson || '[]'); } catch {}
                  return (
                    <div 
                      key={del.id}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>Version {del.versionNumber}</strong>
                          <span className={`badge ${del.status === 'Approved' ? 'badge-emerald' : del.status === 'RevisionRequested' ? 'badge-rose' : 'badge-amber'}`} style={{ marginLeft: '10px' }}>
                            {del.status}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(del.createdAtUtc).toLocaleString()}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        {del.notes}
                      </p>

                      {/* Deliverable Video Preview Link */}
                      {urls.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <video 
                            src={urls[0]} 
                            controls 
                            style={{ width: '100%', maxHeight: '260px', borderRadius: '8px', backgroundColor: '#000' }} 
                          />
                        </div>
                      )}

                      {/* Revision Feedback Display */}
                      {del.revisionFeedback && (
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)', borderLeft: '3px solid var(--accent-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                          <strong style={{ display: 'block', color: '#fda4af', marginBottom: '2px' }}>Client Revision Notes:</strong>
                          {del.revisionFeedback}
                        </div>
                      )}

                      {/* Client Review Actions */}
                      {isClient && del.status === 'Submitted' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                          <button
                            onClick={() => { setSelectedDeliveryId(del.id); setRevisionModal(true); }}
                            className="btn btn-secondary btn-sm"
                          >
                            <RefreshCw size={14} /> Request Revision
                          </button>
                          <button
                            onClick={() => handleApproveDelivery(del.id)}
                            className="btn btn-emerald btn-sm"
                          >
                            <Check size={14} /> Approve & Complete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gated Verified Review Card (if project completed) */}
          {project.status === 'Completed' && (
            <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--accent-emerald)" />
                  <h2 style={{ fontSize: '1.25rem' }}>Verified Project Review</h2>
                </div>
                {isClient && !project.review && (
                  <button onClick={() => setReviewModal(true)} className="btn btn-primary btn-sm">
                    <Star size={14} /> Leave Verified Review
                  </button>
                )}
              </div>

              {project.review ? (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', marginBottom: '8px' }}>
                    <Star size={18} fill="#fbbf24" />
                    <strong>{project.review.overallRating} / 5 Stars Overall</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <span>Communication: <strong>{project.review.communicationRating}/5</strong></span>
                    <span>Quality: <strong>{project.review.qualityRating}/5</strong></span>
                    <span>Timeliness: <strong>{project.review.timelinessRating}/5</strong></span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    "{project.review.comment}"
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  This project has been approved. The client can leave a verified review reflecting on communication, quality, and turnaround.
                </p>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Physical Shipping & SLA Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Physical Product Shipment Box (Specialized UGC Flow) */}
          {project.requiresShipment && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Truck size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>Physical Product Shipment</h3>
              </div>

              {project.trackingNumber ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Courier:</strong> {project.courierName}</div>
                  <div><strong>Tracking ID:</strong> <span style={{ color: 'var(--accent-cyan)' }}>{project.trackingNumber}</span></div>
                  <div><strong>Shipped On:</strong> {new Date(project.productShippedAtUtc!).toLocaleDateString()}</div>
                  
                  {project.productReceivedAtUtc ? (
                    <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', marginTop: '6px' }}>
                      ✓ Product received by creator. SLA timer running.
                    </div>
                  ) : (
                    isPro && (
                      <button onClick={handleConfirmProductReceived} className="btn btn-emerald btn-sm" style={{ marginTop: '10px' }}>
                        Confirm Product Received
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Physical sample shipment is required for this brief.
                  </p>
                  {isClient && (
                    <button onClick={() => setShipmentModal(true)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      Enter Tracking Number
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Chat Shortcut */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Project Negotiation Chat</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Communicate directly with the other party in real-time.
            </p>
            <button onClick={() => onNavigate('messages')} className="btn btn-secondary" style={{ width: '100%' }}>
              <MessageSquare size={16} /> Open Chat Thread
            </button>
          </div>

        </div>

      </div>

      {/* SHIPMENT MODAL */}
      {shipmentModal && (
        <div className="modal-overlay" onClick={() => setShipmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Enter Shipment Tracking Details</h2>
            <form onSubmit={handleUpdateShipment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Courier Partner</label>
                <input required placeholder="e.g. BlueDart, Delhivery, FedEx" value={courierName} onChange={(e) => setCourierName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tracking / AWB Number</label>
                <input required placeholder="e.g. BLU-984920482" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-field" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShipmentModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Tracking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT DELIVERY MODAL */}
      {deliveryModal && (
        <div className="modal-overlay" onClick={() => setDeliveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Submit Deliverable Asset</h2>
            <form onSubmit={handleSubmitDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Delivery / Video Preview URL</label>
                <input placeholder="https://drive.google.com/... or cloud asset link" value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes & Description of Cuts</label>
                <textarea required rows={4} placeholder="Summary of cuts, music choices, or variations..." value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} className="textarea-field" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setDeliveryModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Upload Deliverable</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVISION REQUEST MODAL */}
      {revisionModal && (
        <div className="modal-overlay" onClick={() => setRevisionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Request Revision</h2>
            <form onSubmit={handleRequestRevision} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Detailed Revision Notes</label>
                <textarea required rows={4} placeholder="Specify timestamp cuts, text hook changes, or pacing adjustments..." value={revisionFeedback} onChange={(e) => setRevisionFeedback(e.target.value)} className="textarea-field" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setRevisionModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-danger">Send Revision Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATED 3-DIMENSION REVIEW MODAL */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={20} color="var(--accent-emerald)" />
              <h2 style={{ fontSize: '1.35rem' }}>Verified Review & Rating</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Rate <strong>{project.professionalName}</strong> on key performance criteria.
            </p>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Overall Experience ({overallRating} / 5 ★)</label>
                <input type="range" min="1" max="5" value={overallRating} onChange={(e) => setOverallRating(Number(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Communication ({commRating}★)</label>
                  <input type="range" min="1" max="5" value={commRating} onChange={(e) => setCommRating(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-cyan)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Quality ({qualRating}★)</label>
                  <input type="range" min="1" max="5" value={qualRating} onChange={(e) => setQualRating(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-emerald)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Timeliness ({timeRating}★)</label>
                  <input type="range" min="1" max="5" value={timeRating} onChange={(e) => setTimeRating(Number(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Written Feedback *</label>
                <textarea required rows={4} placeholder="Share what was great about this collaboration..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="textarea-field" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setReviewModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-emerald">Submit Verified Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
