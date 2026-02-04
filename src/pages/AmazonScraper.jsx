import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Star, DollarSign, TrendingUp, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Mock data for demo
const mockProductData = [
  {
    asin: "B0BZYCJK89",
    title: "Apple iPhone 15 Pro Max (256 GB) - Natural Titanium",
    price: "$1,199.00",
    rating: 4.7,
    reviews: 2847,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200",
    category: "Electronics",
    brand: "Apple",
    inStock: true,
    bestseller: true
  },
  {
    asin: "B09X5JQ8M2",
    title: "Samsung Galaxy S24 Ultra 5G (512GB, 12GB) 6.8\" 200MP",
    price: "$1,299.99",
    rating: 4.6,
    reviews: 1523,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200",
    category: "Electronics",
    brand: "Samsung",
    inStock: true,
    bestseller: false
  },
  {
    asin: "B0CX23V2ZK",
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    price: "$349.99",
    rating: 4.8,
    reviews: 4521,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200",
    category: "Electronics",
    brand: "Sony",
    inStock: true,
    bestseller: true
  },
  {
    asin: "B08N5WRWNW",
    title: "Apple AirPods Pro (2nd Generation)",
    price: "$249.00",
    rating: 4.7,
    reviews: 8965,
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200",
    category: "Electronics",
    brand: "Apple",
    inStock: true,
    bestseller: true
  },
  {
    asin: "B0BDJ4XVD7",
    title: "Amazon Echo Dot (5th Gen) with Clock | Smart Speaker",
    price: "$59.99",
    rating: 4.5,
    reviews: 12453,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=200",
    category: "Electronics",
    brand: "Amazon",
    inStock: true,
    bestseller: false
  }
];

const mockReviews = [
  { rating: 5, title: "Amazing product!", author: "John D.", date: "2024-01-15", verified: true, text: "This product exceeded my expectations. Highly recommended!" },
  { rating: 4, title: "Good value", author: "Sarah M.", date: "2024-01-10", verified: true, text: "Works well for the price. Would buy again." },
  { rating: 5, title: "Perfect!", author: "Mike R.", date: "2024-01-08", verified: false, text: "Exactly what I needed. Fast shipping too." },
  { rating: 3, title: "It's okay", author: "Lisa K.", date: "2024-01-05", verified: true, text: "Does the job but nothing special." }
];

export default function AmazonScraper() {
  const [activeTab, setActiveTab] = useState("products");
  const [searchType, setSearchType] = useState("keywords");
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (activeTab === "products") {
        setResults(mockProductData);
      } else if (activeTab === "reviews") {
        setResults(mockReviews);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Package className="w-4 h-4" />
            Amazon Data Scraper
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Amazon Product Scraper
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Extract product data, reviews, and seller information from Amazon
          </p>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="seller">Seller Info</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search Card */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    Search Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Search Type</Label>
                      <Select value={searchType} onValueChange={setSearchType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asin">By ASIN</SelectItem>
                          <SelectItem value="keywords">By Keywords</SelectItem>
                          <SelectItem value="url">By URL</SelectItem>
                          <SelectItem value="category">By Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {searchType === "asin" && "ASIN"}
                        {searchType === "keywords" && "Keywords"}
                        {searchType === "url" && "Product URL"}
                        {searchType === "category" && "Category URL"}
                      </Label>
                      <Input
                        placeholder={
                          searchType === "asin" ? "e.g., B0BZYCJK89" :
                          searchType === "keywords" ? "e.g., Apple Watch" :
                          "https://www.amazon.com/..."
                        }
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSearch} className="w-full" disabled={loading}>
                    {loading ? "Searching..." : "Search Products"}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {results && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Search Results ({results.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              ASIN
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {results.map((product, idx) => (
                            <motion.tr
                              key={product.asin}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                                  />
                                  <div className="max-w-xs">
                                    <p className="font-medium text-slate-900 line-clamp-2">
                                      {product.title}
                                    </p>
                                    <p className="text-sm text-slate-500">{product.brand}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-slate-900">{product.price}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-medium">{product.rating}</span>
                                  </div>
                                  <span className="text-sm text-slate-500">({product.reviews})</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  {product.inStock && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      In Stock
                                    </Badge>
                                  )}
                                  {product.bestseller && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                      Bestseller
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                  {product.asin}
                                </code>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    Get Product Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Product URL</Label>
                    <Input
                      placeholder="https://www.amazon.com/dp/B0BZYCJK89"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSearch} className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Get Reviews"}
                  </Button>
                </CardContent>
              </Card>

              {results && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      Customer Reviews ({results.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Review
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {results.map((review, idx) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-slate-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-md">
                                <p className="font-medium text-slate-900 mb-1">{review.title}</p>
                                <p className="text-sm text-slate-600">{review.text}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-slate-900">{review.author}</p>
                                  {review.verified && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {review.date}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Seller Tab */}
          <TabsContent value="seller">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Get Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Seller URL</Label>
                  <Input placeholder="https://www.amazon.com/sp?seller=XXXXX" />
                </div>
                <Button className="w-full">Get Seller Info</Button>
                <div className="text-center text-sm text-slate-500 mt-4">
                  Feature coming soon - Backend integration required
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Product Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Extract complete product information including prices, ratings, images, and specifications.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Customer Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Collect customer reviews, ratings, and verified purchase information for any product.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Market Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Analyze pricing trends, bestsellers, and competitive products for market insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}