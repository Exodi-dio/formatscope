import { useCallback } from "react";

import type { VerifyResult } from "@formatscope/core";

interface VerifyPanelProps {
  result: VerifyResult | null;
  onVerify: () => void;
}

export function VerifyPanel({ result, onVerify }: VerifyPanelProps) {
  const handleVerify = useCallback(() => {
    onVerify();
  }, [onVerify]);

  if (!result) {
    return (
      <div className="verify-panel">
        <div className="verify-panel-header">Verify</div>
        <button className="verify-button" onClick={handleVerify}>
          Verify
        </button>
        <div className="verify-empty">Run verification to see results.</div>
      </div>
    );
  }

  return (
    <div className="verify-panel">
      <div className="verify-panel-header">Verify</div>
      <div className={`verify-result ${result.ok ? "verify-ok" : "verify-fail"}`}>
        {result.ok ? "✓ Round-trip OK" : "✗ Round-trip mismatch"}
      </div>
      {result.firstDiffOffset !== null ? (
        <div className="verify-diff">
          First differing byte at offset{' '}
          <span className="verify-offset">
            0x{result.firstDiffOffset.toString(16).padStart(4, "0")}
          </span>
          (expected 0x{"00"}, actual 0x{"00"})
        </div>
      ) : (
        <div className="verify-diff verify-diff-ok">All bytes match.</div>
      )}
      <button className="verify-button" onClick={handleVerify}>
        Re-verify
      </button>
    </div>
  );
}
