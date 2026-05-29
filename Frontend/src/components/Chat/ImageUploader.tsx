import { useRef } from "react";

interface ImageUploaderProps {
  roomId: string;
  userId: number;
  userName: string;
  userType: string;
  onUploadStart?: () => void;
  onUploadComplete?: (file: File | null, caption?: string) => void;
}

export default function ImageUploader({ onUploadStart, onUploadComplete }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onUploadComplete?.(null);
      return;
    }
    onUploadStart?.();
    onUploadComplete?.(file);
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="p-1.5 text-gray-500 hover:text-[#A989C8]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </button>
    </>
  );
}
