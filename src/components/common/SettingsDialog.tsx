import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [leaguePath, setLeaguePath] = useState<string>("");
  
  useEffect(() => {
    if (open) {
      invoke("get_lol_path")
        .then((path: string) => {
          setLeaguePath(path);
        })
        .catch((error) => {
          toast.error("Failed to load League path");
          console.error("Error loading League path:", error);
        });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200">
        <DialogHeader>
          <DialogTitle className="text-white/90">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">League of Legends Path</label>
            <div className="p-3 rounded bg-white/5 text-white/60 text-sm animate-in fade-in-50 duration-200">
              {leaguePath || "Loading..."}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;