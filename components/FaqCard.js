"use client";
import { useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";

export default function FaqCard({ faq }) {
  const [viewMore, setViewMore] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-xs w-full rounded-2xl border border-white/30 p-1">
      <div className="bg-dark-blue rounded-xl p-10">
        <div className="flex justify-between mb-6">
          <div className="flex gap-4 items-center">
            <div className="text-off-white text-5xl font-semibold mr-4">
              {faq.id}
            </div>
            <div>
              <h3 className="text-white text-3xl font-semibold">
                {faq.question}
              </h3>
            </div>
          </div>
          <div>
            <div
              onClick={() => setViewMore(!viewMore)}
              className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold hover:border hover:border-gold transition-all cursor-pointer"
            >
              <AiFillPlusCircle
                className={`w-6 h-6 text-white ${
                  viewMore ? "rotate-45" : "rotate-0"
                }`}
              />
            </div>
          </div>
        </div>
        {viewMore && <p className="text-off-white text-sm">{faq.answer}</p>}
      </div>
    </div>
  );
}
