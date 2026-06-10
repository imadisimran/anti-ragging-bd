export interface Incident {
    id: string;
    timestamp: string;
    category: string;
    priority: "High" | "Medium" | "Low";
    status: "INVESTIGATING" | "RESOLVED" | "REJECTED" | "PENDING" | "SUBMITTED";
    location: string;
    evidenceCount: number;
    description: string;
    assignedInvestigator?: string;
    disputeReason?: string;
    isRaggingIncident?: boolean;
    rejectionReason?: string | null;
    adminVerification?: any;
    proofUrls?: ProofUrlType[];
    userId: string;
}

export interface ProofUrlType { secureUrl: string; resource_type: string }

export interface AuthorityReview {
  userId: string;
  name: string;
  designation: string;
  status: "INVESTIGATING" | "FAKE" | "RESOLVED";
  comment: string;
  timestamp: Date;
}

export interface ReportComment {
  commentId: string;
  authorId: string;
  authorName: string;
  authorRole: string; // "student" or designation
  isAuthority: boolean;
  content: string;
  timestamp: Date;
  parentId?: string; // For threaded replies
}

export interface AdminIncidentModalProps {
    isOpen: boolean;
    incident: Incident | null;
    onClose: () => void;
    onUpdateIncident: (updatedIncident: Incident) => void;
}