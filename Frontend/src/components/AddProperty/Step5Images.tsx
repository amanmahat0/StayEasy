import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { API_BASE } from "../../config";

interface Props {
  formData: any;
  setFormData: any;
  existingImages?: Array<{id: number, image: string}>;
  setExistingImages?: React.Dispatch<React.SetStateAction<Array<{id: number, image: string}>>>;
}

const Step5Images: React.FC<Props> = ({ formData, setFormData, existingImages, setExistingImages }) => {
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

  const handleRemoveExisting = (id: number) => {
    if (setExistingImages) {
      setExistingImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  const totalImages = (existingImages?.length || 0) + (formData.images?.length || 0);
  const maxVisible = 3;
  const showOverlay = totalImages > maxVisible;
  const visibleCount = showOverlay ? maxVisible - 1 : totalImages;
  const overlayCount = totalImages - visibleCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos</h2>
        <p className="text-gray-500">Upload property images</p>
      </div>

      {existingImages && existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(() => {
            const items: React.ReactNode[] = [];
            let shown = 0;

            if (existingImages) {
              for (const img of existingImages) {
                if (showOverlay && shown >= visibleCount) break;
                items.push(
                  <div key={`existing-${img.id}`} className="border rounded-lg overflow-hidden relative group">
                    <img
                      src={`${API_BASE}${img.image}`}
                      alt="Property"
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
                shown++;
              }
            }

            if (showOverlay) {
              items.push(
                <div key="overlay" className="border rounded-lg overflow-hidden relative bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">+{overlayCount}</span>
                </div>
              );
            }

            return items;
          })()}
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 hover:border-[#A87DC2] rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#A87DC2]/5"
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
          <p className="text-sm font-semibold text-gray-700 mb-3">{formData.images.length} new photo(s) selected</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
