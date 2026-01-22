import React, { useEffect, useState } from "react";

const DealsOfTheDay = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const d = new Date();
      // Seconds since start of the hour
      const seconds = d.getMinutes() * 60 + d.getSeconds();
      const intervalSeconds = 60 * 20; // 20 minutes block
      const remaining = intervalSeconds - (seconds % intervalSeconds);

      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;

      setTimeLeft(`${min}:${sec < 10 ? "0" : ""}${sec}`);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="shadow-[0_1px_1.5px_0_rgba(0,0,0,0.16)] flex justify-center bg-white w-full">
      <div className="relative border-b w-full border-[#f0f0f0] bg-white overflow-hidden block">
        <div className="flex w-full h-full relative z-10 items-center justify-center">
          <div className="flex flex-col -ml-30 items-center justify-center overflow-hidden text-ellipsis">
            <div className="text-[17px] overflow-hidden text-blue-500">
              Deals of the Day
            </div>
            <div className="mt-1">
              <div className="flex -mt-1 items-center opacity-80 text-[#7f7f7f]">
                <img
                  className="mr-1.5 h-4 w-4"
                  src="/assets/images/theme/clock.svg"
                  alt="timer"
                />
                <div className="text-blue-500 text-[20px]">{timeLeft}</div>
              </div>
            </div>
          </div>
          <div className="absolute right-0">
            <button className="bg-white text-red-600 border-none py-[7px] px-[13px] text-[13px] font-bold cursor-pointer rounded-[2px] shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] uppercase ">
              SALE IS LIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsOfTheDay;
