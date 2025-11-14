import React from 'react';

const GlobalLoader = () => {
  return (
    <div className="w-[200px] h-[60px] relative z-10 flex justify-center items-center">
      {/* Circles */}
      <div className="
        w-5 h-5 absolute rounded-full bg-black left-[15%] origin-center
        animate-[circleBounce_0.5s_alternate_infinite_ease]
      "></div>
      <div className="
        w-5 h-5 absolute rounded-full bg-black left-[45%] origin-center
        animate-[circleBounce_0.5s_alternate_infinite_ease] animation-delay-200
      "></div>
      <div className="
        w-5 h-5 absolute rounded-full bg-black left-auto right-[15%] origin-center
        animate-[circleBounce_0.5s_alternate_infinite_ease] animation-delay-300
      "></div>
      
      {/* Shadows */}
      <div className="
        w-5 h-1 absolute rounded-full bg-black/90 top-[62px] origin-center left-[15%] 
        z-[-1] blur-sm
        animate-[shadowScale_0.5s_alternate_infinite_ease]
      "></div>
      <div className="
        w-5 h-1 absolute rounded-full bg-black/90 top-[62px] origin-center left-[45%] 
        z-[-1] blur-sm
        animate-[shadowScale_0.5s_alternate_infinite_ease] animation-delay-200
      "></div>
      <div className="
        w-5 h-1 absolute rounded-full bg-black/90 top-[62px] origin-center left-auto right-[15%] 
        z-[-1] blur-sm
        animate-[shadowScale_0.5s_alternate_infinite_ease] animation-delay-300
      "></div>
    </div>
  );
};

export default GlobalLoader;