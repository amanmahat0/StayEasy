import { useRef, useState, useEffect } from "react";
import { Pencil, Type, Upload, Trash2, Check } from "lucide-react";

interface SignaturePadProps {
  userName: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

type SignatureMode = "draw" | "type" | "upload";

export default function SignaturePad({ userName, onSave, onClose }: SignaturePadProps) {
  const [mode, setMode] = useState<SignatureMode>("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getSignatureDataUrl = (): string | null => {
    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    }
    if (mode === "type") {
      if (!typedSignature.trim()) return null;
      if (typedSignature.trim().toLowerCase() !== userName.trim().toLowerCase()) {
        alert(`Name must match "${userName}"`);
        return null;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1f2937";
      ctx.font = "36px 'Brush Script MT', 'Segoe Script', 'Comic Sans MS', cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      return canvas.toDataURL("image/png");
    }
    if (mode === "upload") {
      return uploadedImage;
    }
    return null;
  };

  const handleSave = () => {
    const dataUrl = getSignatureDataUrl();
    if (!dataUrl) {
      alert("Please provide your signature first.");
      return;
    }
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Sign Agreement</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { mode: "draw" as SignatureMode, icon: Pencil, label: "Draw" },
              { mode: "type" as SignatureMode, icon: Type, label: "Type" },
              { mode: "upload" as SignatureMode, icon: Upload, label: "Upload" },
            ].map(({ mode: m, icon: Icon, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  mode === m
                    ? "bg-[#A989C8] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Draw Mode */}
          {mode === "draw" && (
            <div>
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <button
                onClick={clearCanvas}
                className="mt-2 text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          {/* Type Mode */}
          {mode === "type" && (
            <div>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder={`Type "${userName}" to sign`}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-xl font-['Brush_Script_MT','Segoe_Script','Comic_Sans_MS',cursive] outline-none focus:border-[#A989C8]"
              />
              <p className="mt-2 text-xs text-gray-400">
                Your typed name must match your account name exactly: <strong>{userName}</strong>
              </p>
            </div>
          )}

          {/* Upload Mode */}
          {mode === "upload" && (
            <div>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-[#A989C8] transition">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload signature image</span>
                <span className="text-xs text-gray-400">PNG, JPG • Transparent background recommended</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
              {uploadedImage && (
                <div className="mt-4">
                  <img src={uploadedImage} alt="Uploaded signature" className="max-h-24 mx-auto border rounded" />
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Preview:</p>
            {mode === "type" && typedSignature && (
              <p className="text-xl font-['Brush_Script_MT','Segoe_Script','Comic_Sans_MS',cursive] text-center text-gray-700">
                {typedSignature}
              </p>
            )}
            {mode === "upload" && uploadedImage && (
              <img src={uploadedImage} alt="Preview" className="max-h-16 mx-auto" />
            )}
            {mode === "draw" && (
              <p className="text-xs text-gray-400 text-center">Draw your signature above</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-[#A989C8] text-white rounded-lg text-sm font-bold hover:bg-[#9678b5] transition"
          >
            <Check className="w-4 h-4" />
            Sign
          </button>
        </div>
      </div>
    </div>
  );
}
