import React from "react";
import { asserts } from "../../assets/assets";

const CategoryStrip = () => {
  const categories = [
    { name: "Categories", img: asserts.categories },
    { name: "Offer Zone", img: asserts.offerzone },
    { name: "Mobiles", img: asserts.mobiles },
    { name: "Fashion", img: asserts.fashion },
    { name: "Electronics", img: asserts.electronics },
    { name: "Appliances", img: asserts.appliances },
    { name: "Home", img: asserts.home },
    { name: "Personal Care", img: asserts.personalcare },
    { name: "Toys & Baby", img: asserts.toybaby },
    { name: "Furniture", img: asserts.furniture },
    { name: "Flights & Hotel", img: asserts.flightandhotel },
    { name: "Sports", img: asserts.sports },
    { name: "Nutrition & more", img: asserts.nutritionandmore },
    { name: "Insurance", img: asserts.insurance },
    { name: "Gift Cards", img: asserts.giftcards },
  ];

  return (
    <div className="bg-white overflow-x-auto no-scrollbar shadow-sm">
      <div className="flex pl-0 p-3 py-0.5 min-w-max space-x-1">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-start min-w-[64px] cursor-pointer group"
          >
            <div className="w-16 h-16 mb-1 overflow-hidden transition-transform transform">
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/64";
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryStrip;
