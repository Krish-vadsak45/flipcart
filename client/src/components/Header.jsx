import { Link } from "react-router-dom";
import { Search, Menu, Plus } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-blue-500">
      <div className="flex flex-col">
        {/* Top Row: Menu, Logo, Icons */}
        <div className="flex items-center justify-between pr-3 py-2">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-1 mt-1">
            <button className="text-white">
              <Menu className="w-10 h-5" />
            </button>
            <Link to="/" className="flex flex-col items-start leading-none">
              <img
                src="/assets/images/logo.png"
                alt="Flipkart"
                className="h-8 object-contain mb-0.5"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<span class="font-bold italic text-white text-lg">Flipkart</span>';
                }}
              />
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center px-1.5 py-0.5">
              <span className="text-white text-[10px] font-bold flex items-center">
                <img
                  src="/assets/images/add.png"
                  alt="Cart"
                  className="w-4 h-4 object-contain"
                />
                <span className="hidden">Login</span>{" "}
                {/* Hiding text, assuming icon only as per typical lite view or user request 'two icon' */}
              </span>
            </div>

            <div className="relative flex items-center text-white font-medium">
              <div className="relative">
                <img
                  src="/assets/images/shoppings.png"
                  alt="Cart"
                  className="w-5 h-5 object-contain"
                />
                <span className="absolute -top-1 -right-1.5 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-blue-600">
                  1
                </span>
              </div>
              {/* <span className="ml-1 text-sm hidden sm:block">Cart</span> */}
            </div>
          </div>
        </div>

        {/* Bottom Row: Search Bar */}
        <div className=" pb-2">
          <div className="bg-white rounded-[2px] w-full flex items-center shadow-sm h-10">
            <input
              type="text"
              className="block w-full px-2 text-[14px] text-gray-800 bg-white border-none rounded-[2px] focus:outline-none placeholder-gray-500 h-full"
              placeholder="Search for Products, Brands and More"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
