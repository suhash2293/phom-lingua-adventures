
// This file is a re-export of the hooks/use-toast.ts file
// to maintain the expected import path for shadcn components

// Import directly from the source to avoid circular dependencies
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
export type { ToasterToast, Toast } from "@/hooks/use-toast";
