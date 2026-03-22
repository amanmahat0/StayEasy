import { Globe } from 'lucide-react';
import { useState } from 'react';

const LanguageCurrency = () => {
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('United States dollar');

  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  const currencies = [
    'United States dollar',
    'Euro',
    'British Pound',
    'Japanese Yen',
    'Indian Rupee',
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#A989C8]/10 rounded-xl flex items-center justify-center text-[#A989C8]">
          <Globe size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Languages & Currency</h2>
          <p className="text-gray-500 text-sm">Manage your language and currency preferences</p>
        </div>
      </div>

      {/* Language Section */}
      <div className="border-t border-gray-100 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Preferred language</h3>
          <button
            className="px-4 py-1.5 bg-[#A989C8]/10 text-[#A989C8] rounded-lg text-sm font-medium hover:bg-[#A989C8] hover:text-white transition-all"
            onClick={() => setIsEditingLanguage(!isEditingLanguage)}
          >
            {isEditingLanguage ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
          {isEditingLanguage ? (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          ) : (
            language
          )}
        </div>
      </div>

      {/* Currency Section */}
      <div className="border-t border-gray-100 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Preferred currency</h3>
          <button
            className="px-4 py-1.5 bg-[#A989C8]/10 text-[#A989C8] rounded-lg text-sm font-medium hover:bg-[#A989C8] hover:text-white transition-all"
            onClick={() => setIsEditingCurrency(!isEditingCurrency)}
          >
            {isEditingCurrency ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
          {isEditingCurrency ? (
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          ) : (
            currency
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageCurrency;
