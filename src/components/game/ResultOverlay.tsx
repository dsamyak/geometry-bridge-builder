import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultOverlayProps {
  state: "idle" | "running" | "success" | "fail";
}

export function ResultOverlay({ state }: ResultOverlayProps) {
  return (
    <AnimatePresence>
      {(state === "success" || state === "fail") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg z-10"
        >
          <div className="text-center">
            {state === "success" ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
                <h2 className="font-display text-3xl font-bold text-success glow-text">
                  Bridge Holds!
                </h2>
                <p className="text-muted-foreground mt-1">Vehicle crossed safely</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
                <h2 className="font-display text-3xl font-bold text-destructive">
                  Structural Failure!
                </h2>
                <p className="text-muted-foreground mt-1">
                  Not enough support — try stronger shapes
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
