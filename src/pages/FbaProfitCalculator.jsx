import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Info, Target } from "lucide-react";
import { motion } from "framer-motion";

// Amazon FBA fee structure (simplified - actual fees may vary)
const REFERRAL_FEES = {
  electronics: 0.08,
  clothing: 0.17,
  books: 0.15,
  homeGarden: 0.15,
  toys: 0.15,
  sports: 0.15,
  beauty: 0.15,
  automotive: 0.12,
};

export default function FBACalculator() {
  const [productCost, setProductCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [shippingToAmazon, setShippingToAmazon] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [category, setCategory] = useState("electronics");
  const [calculation, setCalculation] = useState(null);

  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "homeGarden", label: "Home & Garden" },
    { value: "toys", label: "Toys" },
    { value: "sports", label: "Sports" },
    { value: "beauty", label: "Beauty" },
    { value: "automotive", label: "Automotive" },
  ];

  const calculateFulfillmentFee = (weightLbs, lengthIn, widthIn, heightIn) => {
    const volume = (lengthIn * widthIn * heightIn) / 1728; // cubic feet
    const dimensionalWeight = volume * 139;
    const billableWeight = Math.max(weightLbs, dimensionalWeight);

    if (billableWeight <= 1) return 2.5;
    if (billableWeight <= 2) return 3.48;
    if (billableWeight <= 3) return 4.09;
    if (billableWeight <= 12) return 4.75 + (billableWeight - 3) * 0.38;
    if (billableWeight <= 70) return 8.17 + (billableWeight - 12) * 0.42;
    return 32.53 + (billableWeight - 70) * 0.83;
  };

  const calculateStorageFee = (lengthIn, widthIn, heightIn) => {
    const volume = (lengthIn * widthIn * heightIn) / 1728;
    return volume * 0.75; // $0.75 per cubic foot per month
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  useEffect(() => {
    const cost = parseFloat(productCost) || 0;
    const price = parseFloat(sellingPrice) || 0;
    const shipping = parseFloat(shippingToAmazon) || 0;
    const weightNum = parseFloat(weight) || 0;
    const lengthNum = parseFloat(length) || 0;
    const widthNum = parseFloat(width) || 0;
    const heightNum = parseFloat(height) || 0;

    if (cost > 0 && price > 0) {
      const referralFeeRate = REFERRAL_FEES[category] || 0.15;
      const referralFee = price * referralFeeRate;

      const fulfillmentFee =
        weightNum > 0 && lengthNum > 0 && widthNum > 0 && heightNum > 0
          ? calculateFulfillmentFee(weightNum, lengthNum, widthNum, heightNum)
          : 3.0;

      const storageFee =
        lengthNum > 0 && widthNum > 0 && heightNum > 0 
          ? calculateStorageFee(lengthNum, widthNum, heightNum) 
          : 0.5;

      const totalFees = referralFee + fulfillmentFee + storageFee;
      const totalCosts = cost + shipping + totalFees;
      const grossProfit = price - totalCosts;
      const profitMargin = price > 0 ? (grossProfit / price) * 100 : 0;
      const roi = cost > 0 ? (grossProfit / cost) * 100 : 0;
      const breakEvenPrice = totalCosts;
      const recommendedPrice = totalCosts / 0.7;

      setCalculation({
        productCost: cost,
        sellingPrice: price,
        shippingToAmazon: shipping,
        referralFee,
        fulfillmentFee,
        storageFee,
        totalFees,
        totalCosts,
        grossProfit,
        profitMargin,
        roi,
        breakEvenPrice,
        recommendedPrice,
      });
    } else {
      setCalculation(null);
    }
  }, [productCost, sellingPrice, shippingToAmazon, weight, length, width, height, category]);

  const getProfitStatus = (margin) => {
    if (margin >= 30)
      return { status: "Profitable", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (margin >= 15)
      return { status: "Marginal", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return { status: "Unprofitable", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const profitStatus = calculation ? getProfitStatus(calculation.profitMargin) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Free Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Amazon FBA Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Calculate your FBA fees, profit margins, and get pricing recommendations
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="productCost">Product Cost</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          id="productCost"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={productCost}
                          onChange={(e) => setProductCost(e.target.value)}
                          className="pl-8 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          id="sellingPrice"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          className="pl-8 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingToAmazon">Shipping to Amazon</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          id="shippingToAmazon"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={shippingToAmazon}
                          onChange={(e) => setShippingToAmazon(e.target.value)}
                          className="pl-8 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Dimensions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Dimensions & Weight
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length">Length (in)</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="width">Width (in)</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (in)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {calculation ? (
              <>
                {/* Profit Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`shadow-lg border ${profitStatus?.border}`}>
                    <CardHeader className={`${profitStatus?.bg} border-b border-slate-200`}>
                      <CardTitle className={`flex items-center gap-2 ${profitStatus?.color}`}>
                        {calculation.profitMargin >= 30 ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : calculation.profitMargin >= 15 ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                        Profit Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                          <p className="text-sm text-slate-600 mb-1">Gross Profit</p>
                          <p className={`text-2xl font-bold ${profitStatus?.color}`}>
                            {formatCurrency(calculation.grossProfit)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                          <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                          <p className={`text-2xl font-bold ${profitStatus?.color}`}>
                            {formatPercentage(calculation.profitMargin)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <Badge
                          variant={
                            calculation.profitMargin >= 30
                              ? "default"
                              : calculation.profitMargin >= 15
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-sm px-4 py-2"
                        >
                          {profitStatus?.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Fee Breakdown */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="shadow-lg border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Fee Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Product Cost</span>
                          <span className="font-medium">{formatCurrency(calculation.productCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Shipping to Amazon</span>
                          <span className="font-medium">{formatCurrency(calculation.shippingToAmazon)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Amazon Referral Fee</span>
                          <span className="font-medium">{formatCurrency(calculation.referralFee)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">FBA Fulfillment Fee</span>
                          <span className="font-medium">{formatCurrency(calculation.fulfillmentFee)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Monthly Storage Fee</span>
                          <span className="font-medium">{formatCurrency(calculation.storageFee)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total Costs</span>
                          <span>{formatCurrency(calculation.totalCosts)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="shadow-lg border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">Break-Even Price</p>
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(calculation.breakEvenPrice)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">Recommended Price (30% margin)</p>
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(calculation.recommendedPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">ROI</p>
                        <p className="text-xl font-bold text-blue-600">{formatPercentage(calculation.roi)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg border-slate-200">
                  <CardContent className="text-center py-12 text-slate-500">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-lg">Enter product details to calculate</p>
                    <p className="text-sm mt-2">Fill in product cost and selling price to see your profit analysis</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid gap-4 md:grid-cols-3 mt-8"
        >
          <Card className="bg-white/60 backdrop-blur border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                FBA Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Amazon FBA fees vary by category and product dimensions. Use accurate measurements for best results.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Consider reducing product dimensions and weight to lower fulfillment and storage fees.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Pricing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Target a 30%+ profit margin for sustainable business growth and competitive pricing.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}