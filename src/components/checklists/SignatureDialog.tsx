import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (signatures: {
    grower_id: string;
    grower_name: string;
    qa_id: string;
    manager_id: string;
  }) => void;
  isPending?: boolean;
}

export function SignatureDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: SignatureDialogProps) {
  const [growerId, setGrowerId] = useState("");
  const [qaId, setQaId] = useState("");
  const [managerId, setManagerId] = useState("");

  // Get current user info and pre-select as grower
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setGrowerId(user.id);
      }
    };

    if (open) {
      loadCurrentUser();
    }
  }, [open]);

  // Fetch all active users (not role-restricted)
  const { data: allUsers } = useQuery({
    queryKey: ["all-active-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");
      
      if (error) throw error;
      return profiles || [];
    },
    enabled: open,
  });

  const handleConfirm = () => {
    if (!growerId) {
      toast.error("Please select a Grower");
      return;
    }
    if (!qaId) {
      toast.error("Please select a QA approver");
      return;
    }
    if (!managerId) {
      toast.error("Please select a Manager approver");
      return;
    }

    const growerName = allUsers?.find(u => u.id === growerId)?.full_name || "";

    onConfirm({
      grower_id: growerId,
      grower_name: growerName,
      qa_id: qaId,
      manager_id: managerId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signature Confirmation</DialogTitle>
          <DialogDescription>
            Please confirm the signatures for this checklist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grower">Grower *</Label>
            <Select value={growerId} onValueChange={setGrowerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Grower" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {allUsers?.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qa">QA Approver *</Label>
            <Select value={qaId} onValueChange={setQaId}>
              <SelectTrigger>
                <SelectValue placeholder="Select QA user" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {allUsers?.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Manager Approver *</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Manager user" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {allUsers?.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Saving..." : "Confirm & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
