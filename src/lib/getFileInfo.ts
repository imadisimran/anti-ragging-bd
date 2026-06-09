import { ProofUrlType } from "@/types/AdminDashboardTypes";

export interface ProofObject {
  secureUrl: string;
  resource_type?: string;
}

export type ProofItem = ProofObject;

export function getFileInfo(proofUrlObj: ProofUrlType) {
  // 1. Safe navigation to handle missing objects or empty arrays
  const secureUrl = proofUrlObj.secureUrl;
  const resourceType = proofUrlObj.resource_type;

  // Helper to capitalize the first letter (e.g., "image" -> "Image")
  const formatType = (type: string) => {
    if (!type) return null;
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  if (!secureUrl) {
    return { type: formatType(resourceType), extension: null };
  }

  try {

    // 3. Extract the extension (e.g., "png")
    const extension = secureUrl.split('.').pop();

    return {
      type: formatType(resourceType),
      // Ensures we don't return the whole string if there is no dot
      extension: extension ? extension : null
    };
  } catch (error) {
    // Handle invalid URL strings gracefully
    console.error("Invalid URL provided", error);
    return { type: formatType(resourceType), extension: null };
  }
}
