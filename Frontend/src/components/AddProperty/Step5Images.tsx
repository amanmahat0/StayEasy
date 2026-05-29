import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

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
    setFormData({
      ...formData,
      images: [...(formData.images || []), ...filesArray],
    });
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const updated = formData.images.filter((_: File, i: number) => i !== index);
    setFormData({ ...formData, images: updated });
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
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {formData.images && formData.images.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">{formData.images.length} photo(s) selected</p>
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((file: File, index: number) => (
              <div key={index} className="border rounded-lg overflow-hidden relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X size={14} />
                </button>
                <p className="text-[10px] text-gray-500 truncate px-1 py-0.5">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Images;
