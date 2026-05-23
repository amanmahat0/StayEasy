import React, { useRef, useState } from "react";

interface ImageUploaderProps {
  roomId: string;
  userId: number;
  userName: string;
  userType: string;
  onUploadStart?: () => void;
  onUploadComplete?: (file: File | null, caption?: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadStart, onUploadComplete }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      if (onUploadStart) onUploadStart();
      if (onUploadComplete) onUploadComplete(file, caption);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-blue-500"
        onClick={() => fileInput.current?.click()}
      >
        <span role="img" aria-label="image">🖼️</span>
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {preview && (
        <div className="ml-2 flex flex-col items-start">
          <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded mb-1" />
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="border rounded px-2 py-1 text-xs"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
