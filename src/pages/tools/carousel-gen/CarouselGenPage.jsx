import { useState } from 'react';
import CarouselInput from './components/CarouselInput';
import CarouselPreview from './components/CarouselPreview';


export default function CarouselGenPage() {
  const [input, setInput] = useState({ text: '', font: '', backgroundColor: '#18181b', textColor: '#fff', enhanceAI: false });
  const [slides, setSlides] = useState([
    "The future of work is remote. It's not just a trend, it's a movement. More and more companies are embracing remote work as a way to attract top talent, boost productivity, and reduce costs. But what does this mean for you?",
    "How can you thrive in this new era of work? In this guide, we'll explore the benefits and challenges of remote work, share tips for staying productive and connected, and help you build a successful remote career.",
    "Let's get started! Here are some actionable steps to make remote work a success for you and your team."
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Split input text into slides by double newlines or periods for demo
  const updateSlides = (text) => {
    let arr = text.split(/\n\n|\.( |$)/).map(s => s.trim()).filter(Boolean);
    setSlides(arr.length ? arr : ['']);
    setCurrentSlide(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (name === 'text') updateSlides(value);
  };

  const handleFontChange = (e) => {
    setInput((prev) => ({ ...prev, font: e.target.value }));
  };

  const handlePrev = () => setCurrentSlide((s) => Math.max(0, s - 1));
  const handleNext = () => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1));

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden flex flex-col md:flex-row items-center shadow-2xl">
        <div className="w-full md:w-1/2 px-8 ">
          <CarouselInput 
            values={input}
            onInputChange={handleInputChange}
            onTemplateSelect={() => {}} 
            onModeToggle={() => {}} 
            onFontChange={handleFontChange}
            onGenerate={() => {}} 
          />
        </div>
        <div className="w-full md:w-1/2 ">
          <CarouselPreview 
            slides={slides}
            currentSlide={currentSlide}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}
