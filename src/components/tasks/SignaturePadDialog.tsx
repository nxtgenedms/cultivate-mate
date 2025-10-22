import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eraser, RotateCcw } from "lucide-react";

interface SignaturePadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (signatureDataUrl: string) => void;
  label: string;
  currentSignature?: string;
}

export function SignaturePadDialog({
  open,
  onOpenChange,
  onSave,
  label,
  currentSignature,
}: SignaturePadDialogProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL();
      onSave(dataUrl);
      onOpenChange(false);
    }
  };

  const handleBeginStroke = () => {
    setIsEmpty(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sign: {label}</DialogTitle>
          <DialogDescription>
            Draw your signature using your mouse or touchscreen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: "w-full h-[200px] cursor-crosshair",
              }}
              backgroundColor="rgb(255, 255, 255)"
              penColor="#000000"
              onBegin={handleBeginStroke}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            <p className="text-xs text-muted-foreground">
              Draw your signature above
            </p>
          </div>

          {currentSignature && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Current Signature:
              </p>
              <div className="border rounded-md p-2 bg-muted/30">
                <img
                  src={currentSignature}
                  alt="Current signature"
                  className="max-h-[80px] mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isEmpty && !currentSignature}
          >
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
