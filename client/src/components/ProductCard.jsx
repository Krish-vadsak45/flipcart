import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Logic updated: Try to use variant[0] but fallback to parent product checks
  // Legacy site used parent 'selling_price', 'name', 'img1' for listing.
  // We prefer variant[0] if available, otherwise fallback.
  const variant =
    product.verients && product.verients.length > 0 ? product.verients[0] : {};

  // Construct display values with fallbacks
  const name = variant.name || product.name;
  const sellingPrice = variant.selling_price || product.selling_price;
  const mrp = variant.mrp || product.mrp;
  const imgUrl = variant.img1 || product.img1;

  if (!name) return null; // Should ideally always have a name

  // Randomize rating like the PHP version (purely visual)
  const randomRating = (Math.random() * (5 - 4) + 4).toFixed(1);
  const ratingCount = Math.floor(Math.random() * (9500 - 7500 + 1)) + 7500;

  // Calculate discount
  const discount =
    mrp && sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  return (
    <div className="bg-white transition-shadow p-4 border border-gray-200 h-full">
      <Link
        to={`/product-details/${product.id}?r=${randomRating}&r1=${ratingCount}`}
        className="flex flex-col h-full text-inherit no-underline"
      >
        <div className="relative h-[170px] flex items-center justify-center w-full">
          <img
            src={imgUrl || "https://via.placeholder.com/150"}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="mt-auto w-full">
          <div className="text-sm font-bold text-gray-800 line-clamp-1 mb-1 leading-tight">
            {name}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-600 text-[15px] font-medium">
              {discount}% Off
            </span>
            <span className="text-gray-500 text-[15px] line-through text-xs">
              ₹{mrp}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[15px] text-black">
              ₹{sellingPrice}
            </span>
            <img
              src="/assets/images/SwOvZ3r.png"
              alt="Assured"
              className="h-5 object-contain"
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <div className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              {randomRating}{" "}
              <img
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTYuNSA5LjQzOWwtMy42NzQgMi4yMy45NC00LjI2LTMuMjEtMi44ODMgNC4yNTQtLjQwNEw2LjUuMTEybDEuNjkgNC4wMSA0LjI1NC40MDQtMy4yMSAyLjg4Mi45NCA0LjI2eiIvPjwvc3ZnPg=="
                className="w-2.5 h-2.5"
                alt=""
              />
            </div>
            <span className="text-gray-500 text-[14px] font-bold">
              {ratingCount} Ratings
            </span>
          </div>

          <div className="text-xs text-green-700 mt-1 text-[13px] flex justify-center">
            Free delivery in Two Days
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
