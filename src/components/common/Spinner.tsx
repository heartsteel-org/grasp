import { motion } from "framer-motion";

export const Spinner = () => {
  return (
    <motion.div
      className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
    />
  );
};
