import { useState } from 'react';
import SuccessModal from '../../components/UI/SuccessModal';

const SuccessModalDemo = () => {
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Success Modal Component</h1>
          <p className="text-lg text-gray-600">Modern success confirmation modals for property rental platform</p>
        </div>

        {/* Demo Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Property Success */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Added Successfully</h2>
              <p className="text-gray-600">First version - showing success confirmation for newly added property</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Modal Features:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ House illustration with success checkmark</li>
                  <li>✓ Dark blurred overlay background</li>
                  <li>✓ "Property Added Successfully!" heading</li>
                  <li>✓ Success message describing the action</li>
                  <li>✓ "View Property" primary button</li>
                  <li>✓ "Close" secondary button</li>
                  <li>✓ Smooth scale-in animation</li>
                  <li>✓ Success indicator badge</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowAddSuccess(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform active:scale-95"
            >
              Show Add Success Modal
            </button>
          </div>

          {/* Update Property Success */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Updated Successfully</h2>
              <p className="text-gray-600">Second version - showing success confirmation for updated property</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Modal Features:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Same design as add version</li>
                  <li>✓ "Property Updated Successfully!" heading</li>
                  <li>✓ Updated-specific message</li>
                  <li>✓ Only "Done" button (no View Property)</li>
                  <li>✓ Additional footer note about changes</li>
                  <li>✓ Consistent Airbnb-inspired styling</li>
                  <li>✓ Professional typography</li>
                  <li>✓ Elegant spacing and layout</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowUpdateSuccess(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform active:scale-95"
            >
              Show Update Success Modal
            </button>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Component Props</h2>
          <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-gray-800">
{`interface SuccessModalProps {
  isOpen: boolean;              // Controls modal visibility
  title: string;                // Modal heading
  message: string;              // Success message
  onClose: () => void;          // Close button handler
  onViewProperty?: () => void;  // View Property button handler
  isUpdate?: boolean;           // Shows update-specific UI
}`}
            </pre>
          </div>
        </div>

        {/* Design Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-gray-900 mb-2">Modern Design</h3>
            <p className="text-sm text-gray-600">Clean, professional Airbnb-inspired aesthetic with green success theme</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-gray-900 mb-2">Smooth Animation</h3>
            <p className="text-sm text-gray-600">Elegant scale-in and fade effects for delightful user experience</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="font-bold text-gray-900 mb-2">Responsive</h3>
            <p className="text-sm text-gray-600">Adapts seamlessly across all screen sizes with mobile-optimized layout</p>
          </div>
        </div>
      </div>

      {/* Success Modal - Add Version */}
      <SuccessModal
        isOpen={showAddSuccess}
        title="Property Added Successfully!"
        message="Your property has been listed successfully and is now available for tenants to view and book."
        onClose={() => setShowAddSuccess(false)}
        onViewProperty={() => {
          alert('Navigating to property details...');
          setShowAddSuccess(false);
        }}
        isUpdate={false}
      />

      {/* Success Modal - Update Version */}
      <SuccessModal
        isOpen={showUpdateSuccess}
        title="Property Updated Successfully!"
        message="Your property details have been updated successfully. The latest changes are now visible on your listing."
        onClose={() => setShowUpdateSuccess(false)}
        isUpdate={true}
      />
    </div>
  );
};

export default SuccessModalDemo;
