'use client';

import { useState } from 'react';

interface SurveyModalProps {
  onSubmit: (age: string, gender: string, frequency: string) => void;
}

export default function SurveyModal({ onSubmit }: SurveyModalProps) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && gender && frequency) {
      onSubmit(age, gender, frequency);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 my-4 max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 text-center">
          Hoş Geldiniz! 👋
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-center text-xs sm:text-sm">
          Deneyiminizi kişiselleştirmek için lütfen birkaç soruyu yanıtlayın
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Gender Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Cinsiyetiniz nedir?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'Kadın', label: 'Kadın' },
                { value: 'Erkek', label: 'Erkek' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all text-sm ${
                    gender === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Yaşınız nedir?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['18-24', '25-34', '35-44', '45-54', '55-64', '65 yaş ve üzeri'].map((ageRange) => (
                <button
                  key={ageRange}
                  type="button"
                  onClick={() => setAge(ageRange)}
                  className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                    age === ageRange
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {ageRange}
                </button>
              ))}
            </div>
          </div>

          {/* Shopping Frequency Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Ne sıklıkla online kıyafet alışverişi yaparsınız?
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                'Haftada bir veya daha sık',
                'Ayda bir',
                '2-3 ayda bir',
                '6 ayda bir',
                'Yılda bir veya daha seyrek',
                'Hiç yapmam'
              ].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg border-2 transition-all text-left text-xs sm:text-sm ${
                    frequency === freq
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!age || !gender || !frequency}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
              age && gender && frequency
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Devam Et
          </button>
        </form>

        <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3 sm:mt-4">
          Verileriniz anonim olarak saklanır ve sadece araştırma amaçlı kullanılır
        </p>
      </div>
    </div>
  );
}
