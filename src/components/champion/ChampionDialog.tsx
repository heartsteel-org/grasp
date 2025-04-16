import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChampionDialogProps } from "@/types/ui";
import { motion } from "framer-motion";

const ChampionDialog = ({
  open,
  onOpenChange,
  skinName,
  splashUrl,
  onLoad,
  status,
}: ChampionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-black/80 backdrop-blur-md border-white/10 overflow-hidden p-0 max-w-5xl w-full"
        style={{ width: "100%", maxWidth: "960px" }}
      >
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
          <img
            src={splashUrl}
            alt={`${skinName} splash`}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80 z-10" />

          <div className="relative z-20 flex flex-col justify-between h-full p-8">
            <DialogHeader>
              <DialogTitle className="text-white text-3xl tracking-wider">
                {skinName}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-end mt-auto">
              <Button
                onClick={onLoad}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md"
              >
                Load Skin
              </Button>
              {status && (
                <div className="flex items-center gap-2 mt-4 text-white text-sm opacity-80">
                  {["loading", "importing", "overlay"].some((keyword) =>
                    status.toLowerCase().includes(keyword)
                  ) && (
                    <motion.div
                      className="w-3 h-3 border-2 border-t-transparent border-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        ease: "linear",
                      }}
                    />
                  )}

                  {status.toLowerCase().includes("loaded") && (
                    <span>✔</span>
                  )}

                  {status.toLowerCase().includes("error") && (
                    <span>✖</span>
                  )}

                  <span>{status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChampionDialog;
