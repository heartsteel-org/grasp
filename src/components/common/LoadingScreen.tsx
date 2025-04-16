import { motion } from "framer-motion";
import Navbar from "@/components/common/Navbar";

const LoadingScreen = ({
  status,
}: {
  status: {
    message: string;
    percent?: number;
    speed_mb_s?: number | null;
    downloaded_mb?: number | null;
    total_mb?: number | null;
  };
}) => {
  const hasValue = (n: number | null | undefined): n is number =>
    n !== null && n !== undefined;

  const showMBInfo =
    hasValue(status.downloaded_mb) &&
    hasValue(status.total_mb) &&
    hasValue(status.speed_mb_s);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col"
    >
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full mb-6"
        />
        <div className="text-xl font-light tracking-wider mb-2">
          {status.message}
        </div>
        {showMBInfo && (
          <div className="text-xs text-white/50">
            {status.downloaded_mb!.toFixed(1)} / {status.total_mb!.toFixed(1)} MB
            @ {status.speed_mb_s!.toFixed(1)} MB/s
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
