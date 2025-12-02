'use client';

import { useState } from 'react';

interface SurveyModalProps {
  onSubmit: (age: string, gender: string, frequency: string) => void;
}

export default function SurveyModal({ onSubmit }: SurveyModalProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = () => {
    if (age && gender && frequency) {
      onSubmit(age, gender, frequency);
    }
  };

  const canProceedStep2 = age && gender;
  const canProceedStep3 = frequency;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 sm:p-7">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all ${
                s === step ? 'bg-blue-600' : s < step ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Online Alışveriş Deneyimi Simülasyonuna Hoş Geldiniz!
            </h2>
            <div className="text-gray-700 text-sm sm:text-base mb-3 space-y-2 text-left">
              <p className="leading-relaxed">
                <strong>Değerli Katılımcı,</strong>
              </p>
              <p className="leading-relaxed">
                Bu çalışma, İstanbul Teknik Üniversitesi bünyesinde yürütülen bir bitirme projesi kapsamında,
                online alışveriş deneyimini iyileştirmek amacıyla hazırlanmıştır.
              </p>
              <p>
                Katkılarınız, projemizin başarısı için büyük önem taşımaktadır. Teşekkür ederiz!
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all"
            >
              Devam Et
            </button>
          </div>
        )}

        {/* Step 2: Questions - Part 1 (Gender & Age) */}
        {step === 2 && (
          <div>
            <div className="space-y-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cinsiyetiniz
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
                      className={`py-2.5 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                        gender === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yaş Aralığınız
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((ageRange) => (
                    <button
                      key={ageRange}
                      type="button"
                      onClick={() => setAge(ageRange === '65+' ? '65 yaş ve üzeri' : ageRange)}
                      className={`py-2.5 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                        (age === ageRange || (ageRange === '65+' && age === '65 yaş ve üzeri'))
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {ageRange}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedStep2}
              className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all ${
                canProceedStep2
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Devam Et
            </button>
          </div>
        )}

        {/* Step 3: Questions - Part 2 (Frequency) */}
        {step === 3 && (
          <div>
            <p className="text-gray-500 text-xs sm:text-sm mb-5 text-center">
              Alışveriş sıklığınızı belirtin
            </p>

            <div className="space-y-5">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Alışveriş Sıklığınız
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'Haftada bir veya daha sık', label: 'Haftada bir veya daha sık' },
                    { value: 'Ayda bir', label: 'Ayda bir' },
                    { value: '2-3 ayda bir', label: '2-3 ayda bir' },
                    { value: '6 ayda bir', label: '6 ayda bir' },
                    { value: 'Yılda bir veya daha seyrek', label: 'Yılda bir veya daha seyrek' },
                    { value: 'Hiç yapmam', label: 'Hiç yapmam' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFrequency(option.value)}
                      className={`w-full py-2.5 px-4 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                        frequency === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedStep3}
              className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all ${
                canProceedStep3
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Devam Et
            </button>
          </div>
        )}

        {/* Step 4: Instructions */}
        {step === 4 && (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Deney Adımları
            </h2>
            <div className="text-gray-700 text-sm sm:text-base mb-3 space-y-2 text-left">
              <p className="leading-relaxed">
                <strong>-</strong> Websitesine yönlendirileceksiniz. Lütfen her kategoriden en az bir (1) ürün sepetinize ekleyiniz
              </p>
              <p className="leading-relaxed">
                <strong>-</strong> Sepetteki "Simülasyonu Bitir" butonuna tıkladığınızda deney sona erecektir.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all"
            >
              Simülasyona Başla
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
