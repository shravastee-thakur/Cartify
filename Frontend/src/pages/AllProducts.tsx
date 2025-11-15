import React, { useState, useMemo } from "react";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  brand: string;
};

type FilterState = {
  categories: string[];
  brands: string[];
  priceSort: "low-to-high" | "high-to-low";
};

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    price: 129.99,
    image: "https://placehold.co/300x300",
    category: "Electronics",
    brand: "Sony",
  },
  {
    id: "2",
    title: "Running Shoes",
    price: 89.99,
    image: "https://placehold.co/300x300",
    category: "Footwear",
    brand: "Nike",
  },
  {
    id: "3",
    title: "Smart Watch",
    price: 199.99,
    image: "https://placehold.co/300x300",
    category: "Electronics",
    brand: "Apple",
  },
  {
    id: "4",
    title: "Backpack",
    price: 49.99,
    image: "https://placehold.co/300x300",
    category: "Accessories",
    brand: "Adidas",
  },
  {
    id: "5",
    title: "Coffee Maker",
    price: 79.99,
    image: "https://placehold.co/300x300",
    category: "Home",
    brand: "Philips",
  },
];

const allCategories = Array.from(new Set(mockProducts.map((p) => p.category)));
const allBrands = Array.from(new Set(mockProducts.map((p) => p.brand)));

const ProductPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceSort: "low-to-high",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false); // For mobile only

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const setPriceSort = (sort: "low-to-high" | "high-to-low") => {
    setFilters((prev) => ({ ...prev, priceSort: sort }));
  };

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }
    result.sort((a, b) =>
      filters.priceSort === "low-to-high"
        ? a.price - b.price
        : b.price - a.price
    );
    return result;
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
          Shop Products
        </h1>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4 flex justify-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-[#FA812F] text-white rounded-md text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on mobile by default */}
          <div
            className={`lg:block fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out
              ${
                isFilterOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0`}
          >
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Filters Content */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Categories</h3>
              <div className="space-y-2 mb-6">
                {allCategories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cat-${category}`}
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 text-[#FA812F] rounded focus:ring-[#FA812F]"
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="ml-2 text-gray-600"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>

              <h3 className="font-medium mb-2 text-gray-700">Brands</h3>
              <div className="space-y-2">
                {allBrands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 text-[#FA812F] rounded focus:ring-[#FA812F]"
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="ml-2 text-gray-600"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          {/* Product Section */}
          <div className="flex-1">
            {/* Price Sort */}
            <div className="mb-6">
              <div className="flex justify-end">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600 text-sm">Sort by:</span>
                  <select
                    value={filters.priceSort}
                    onChange={(e) => setPriceSort(e.target.value as any)}
                    className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FA812F]"
                  >
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-40 flex items-center justify-center bg-gray-50 p-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                      {product.title}
                    </h3>
                    <p className="text-[#FA812F] font-bold">
                      ${product.price.toFixed(2)}
                    </p>
                    <button className="mt-2 w-full bg-[#FA812F] hover:bg-[#e8721f] text-white py-1.5 rounded text-sm transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-600">
                No products match your filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
