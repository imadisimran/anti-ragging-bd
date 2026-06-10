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
}

export interface ProofUrlType { secureUrl: string; resource_type: string }

export interface AdminIncidentModalProps {
    isOpen: boolean;
    incident: Incident | null;
    onClose: () => void;
    onUpdateIncident: (updatedIncident: Incident) => void;
}