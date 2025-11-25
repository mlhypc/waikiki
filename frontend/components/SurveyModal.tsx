'use client';

import { useState } from 'react';

interface SurveyModalProps {
  onSubmit: (age: string, gender: string) => void;
}

export default function SurveyModal({ onSubmit }: SurveyModalProps) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && gender) {
      onSubmit(age, gender);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Hoş Geldiniz! 👋
        </h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Deneyiminizi kişiselleştirmek için lütfen birkaç soruyu yanıtlayın
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yaş Aralığınız
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['18-24', '25-34', '35-44', '45+'].map((ageRange) => (
                <button
                  key={ageRange}
                  type="button"
                  onClick={() => setAge(ageRange)}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
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

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cinsiyet
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'Kadın', label: 'Kadın' },
                { value: 'Erkek', label: 'Erkek' },
                { value: 'Diğer', label: 'Diğer' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!age || !gender}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              age && gender
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Devam Et
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Verileriniz anonim olarak saklanır ve sadece araştırma amaçlı kullanılır
        </p>
      </div>
    </div>
  );
}
