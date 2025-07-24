import React from 'react';

export default function CarouselPreview({ slides = [], currentSlide = 0, onPrev, onNext }) {
  return (
    <div>
      <div className="flex flex-col justify-center items-center p-8 w-full min-h-[500px] bg-dark-800 rounded-2xl transition-all duration-500">
        <div className="flex items-center w-full justify-center gap-4">

          <div className="flex-1 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Slide {currentSlide + 1} of {slides.length}
            </h3>
            <div className="text-white text-lg mb-8 max-w-2xl relative overflow-hidden" style={{ minHeight: 120 }}>
              {slides.length > 0 && (
                <span className="block animate-fade-in">{slides[currentSlide]}</span>
              )}
            </div>
          </div>

        </div>

        <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
      </div>
      <div className='flex justify-center items-center gap-4 mt-4'>
        <button
          type="button"
          aria-label="Previous slide"
          className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition disabled:opacity-40"
          onClick={onPrev}
          disabled={currentSlide === 0}
        >
          &larr;
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition disabled:opacity-40"
          onClick={onNext}
          disabled={currentSlide === slides.length - 1}
        >
          &rarr;
        </button>

      </div>
    </div>
  );
}
