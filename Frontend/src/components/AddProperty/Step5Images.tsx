import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  formData: any;
  setFormData: any;
}

const Step5Images: React.FC<Props> = ({ formData, setFormData }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);

    // Save files in formData.images (or create array if doesn't exist)
    setFormData({
      ...formData,
      images: [...(formData.images || []), ...filesArray],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos</h2>
        <p className="text-gray-500">Upload property images</p>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 hover:border-[#A87DC2] rounded-2xl p-12 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#A87DC2]/5"
        onClick={handleClick}
      >
        <Upload className="mx-auto text-[#A87DC2] mb-4" size={40} />
        <p className="font-semibold text-gray-700">Click to upload photos</p>
        <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
        <input
          type="file"
          multiple
          ref={inputRef}
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {formData.images && formData.images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {formData.images.slice(0, 3).map((file: File, index: number) => (
            <div key={index} className="border rounded-lg overflow-hidden relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-24 object-cover"
              />
              {index === 2 && formData.images.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                  +{formData.images.length - 3} more
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step5Images;
