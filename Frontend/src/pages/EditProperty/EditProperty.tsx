import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import PublicNavbar from '../../components/Navbar/PublicNavbar';
import { getLandlordPropertyDetail, updateLandlordProperty } from '../../services/api';

type PropertyFormData = {
  property_type: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  available: boolean;
};

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const propertyId = parseInt(id || '0');

  const [formData, setFormData] = useState<PropertyFormData>({
    property_type: 'apartment',
    title: '',
    description: '',
    address: '',
    city: '',
    price: 0,
    available: true,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Fetch property
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const property = await getLandlordPropertyDetail(propertyId);

        setFormData({
          property_type: property.property_type || 'apartment',
          title: property.title || '',
          description: property.description || '',
          address: property.address || '',
          city: property.city || '',
          price: property.price || 0,
          available: property.available !== false,
        });

        setExistingImages(property.images || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchProperty();
  }, [propertyId]);

  // ✅ Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title required';
    if (!formData.description.trim()) newErrors.description = 'Description required';
    if (!formData.address.trim()) newErrors.address = 'Address required';
    if (!formData.city.trim()) newErrors.city = 'City required';
    if (formData.price <= 0) newErrors.price = 'Price must be > 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Image handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('property_type', formData.property_type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('available', String(formData.available));

      // keep remaining old images
      formDataToSend.append('existing_images', JSON.stringify(existingImages));

      // new uploads
      newImages.forEach((img) => {
        formDataToSend.append('images', img);
      });

      await updateLandlordProperty(propertyId, formDataToSend);

      setSuccess('Property updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-3xl mx-auto p-6">
        <button onClick={() => navigate('/dashboard')} className="flex gap-2 mb-6">
          <ArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Edit Property</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl">

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border p-3 rounded"
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border p-3 rounded"
          />

          {/* Address */}
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border p-3 rounded"
          />

          {/* City */}
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full border p-3 rounded"
          />

          {/* Price */}
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            className="w-full border p-3 rounded"
          />

          {/* Images */}
          <div>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />

            <div className="grid grid-cols-3 gap-4 mt-4">
              {/* Existing */}
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} className="h-24 w-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2"
                  >
                    X
                  </button>
                </div>
              ))}

              {/* New */}
              {newImages.map((file, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-24 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 text-white py-3 rounded"
          >
            {submitting ? 'Updating...' : 'Update Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;