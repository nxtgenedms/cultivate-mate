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
import { Input } from "@/components/ui/input";
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
  const [growerName, setGrowerName] = useState("");
  const [growerId, setGrowerId] = useState("");
  const [qaId, setQaId] = useState("");
  const [managerId, setManagerId] = useState("");

  // Get current user info
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setGrowerName(profile.full_name);
          setGrowerId(user.id);
        }
      }
    };

    if (open) {
      loadCurrentUser();
    }
  }, [open]);

  // Fetch QA users
  const { data: qaUsers } = useQuery({
    queryKey: ["qa-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, profiles!inner(id, full_name)")
        .eq("role", "qa");
      
      if (error) throw error;
      return data.map((item: any) => ({
        id: item.user_id,
        full_name: item.profiles.full_name,
      }));
    },
    enabled: open,
  });

  // Fetch Manager users
  const { data: managerUsers } = useQuery({
    queryKey: ["manager-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, profiles!inner(id, full_name)")
        .in("role", ["manager", "supervisor"]);
      
      if (error) throw error;
      return data.map((item: any) => ({
        id: item.user_id,
        full_name: item.profiles.full_name,
      }));
    },
    enabled: open,
  });

  const handleConfirm = () => {
    if (!qaId) {
      toast.error("Please select a QA approver");
      return;
    }
    if (!managerId) {
      toast.error("Please select a Manager approver");
      return;
    }

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
            <Label htmlFor="grower">Grower</Label>
            <Input
              id="grower"
              value={growerName}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qa">QA Approver *</Label>
            <Select value={qaId} onValueChange={setQaId}>
              <SelectTrigger>
                <SelectValue placeholder="Select QA user" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {qaUsers?.map((user: any) => (
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
                {managerUsers?.map((user: any) => (
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
