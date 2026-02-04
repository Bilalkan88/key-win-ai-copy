import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

function Field({ label, value, setValue, step = "1", helpText, prefix = "$" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          step={step}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 ${prefix ? 'pl-8' : ''}`}
        />
      </div>
      {helpText && (
        <p className="text-xs text-slate-500 mt-1">{helpText}</p>
      )}
    </div>
  );
}

export default function AmazonSellerToolkit() {
  // Form State
  const [sellingPrice, setSellingPrice] = useState('29.99');
  const [unitsOrdered, setUnitsOrdered] = useState('500');
  const [unitsSold, setUnitsSold] = useState('450');
  const [productCostTotal, setProductCostTotal] = useState('3000');
  const [shippingToAmazon, setShippingToAmazon] = useState('800');
  const [fbaFeePerUnit, setFbaFeePerUnit] = useState('5.50');
  const [adSpendTotal, setAdSpendTotal] = useState('900');

  // Price Scenario State
  const [scenarioFees, setScenarioFees] = useState({
    low: '5.00',
    mid: '5.50',
    high: '6.00'
  });

  // Calculations
  const calculations = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0;
    const ordered = parseFloat(unitsOrdered) || 0;
    const sold = parseFloat(unitsSold) || 0;
    const productCost = parseFloat(productCostTotal) || 0;
    const shipping = parseFloat(shippingToAmazon) || 0;
    const fbaFee = parseFloat(fbaFeePerUnit) || 0;
    const adSpend = parseFloat(adSpendTotal) || 0;

    // Validation
    if (ordered === 0) {
      return { error: 'Units ordered cannot be zero', valid: false };
    }

    // Core calculations
    const landedCostPerUnit = (productCost + shipping) / ordered;
    const adCostPerUnit = sold > 0 ? adSpend / sold : 0;
    const totalCostPerUnit = landedCostPerUnit + fbaFee + adCostPerUnit;
    const profitPerUnit = price - totalCostPerUnit;
    const margin = price > 0 ? (profitPerUnit / price) * 100 : 0;
    const roi = landedCostPerUnit > 0 ? (profitPerUnit / landedCostPerUnit) * 100 : 0;

    return {
      valid: true,
      landedCostPerUnit,
      adCostPerUnit,
      totalCostPerUnit,
      profitPerUnit,
      margin,
      roi,
      price
    };
  }, [sellingPrice, unitsOrdered, unitsSold, productCostTotal, shippingToAmazon, fbaFeePerUnit, adSpendTotal]);

  // Decision Indicator
  const getDecision = () => {
    if (!calculations.valid) return null;
    
    const { margin, roi } = calculations;
    
    if (margin >= 30 && roi >= 100) {
      return {
        label: 'منتج ممتاز',
        color: 'bg-emerald-500',
        icon: CheckCircle,
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      };
    } else if (margin >= 15 && margin < 30) {
      return {
        label: 'منتج متوسط',
        color: 'bg-yellow-500',
        icon: AlertCircle,
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    } else {
      return {
        label: 'غير موصى به',
        color: 'bg-red-500',
        icon: XCircle,
        textColor: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }
  };

  // Price Scenarios
  const priceScenarios = useMemo(() => {
    if (!calculations.valid) return [];

    const ordered = parseFloat(unitsOrdered) || 0;
    const sold = parseFloat(unitsSold) || 0;
    const productCost = parseFloat(productCostTotal) || 0;
    const shipping = parseFloat(shippingToAmazon) || 0;
    const adSpend = parseFloat(adSpendTotal) || 0;

    const landedCostPerUnit = (productCost + shipping) / ordered;
    const adCostPerUnit = sold > 0 ? adSpend / sold : 0;

    const scenarios = [
      { 
        label: 'Low Price', 
        price: (parseFloat(sellingPrice) * 0.85).toFixed(2),
        feeKey: 'low'
      },
      { 
        label: 'Mid Price', 
        price: parseFloat(sellingPrice).toFixed(2),
        feeKey: 'mid'
      },
      { 
        label: 'High Price', 
        price: (parseFloat(sellingPrice) * 1.15).toFixed(2),
        feeKey: 'high'
      }
    ];

    return scenarios.map(s => {
      const price = parseFloat(s.price);
      const fee = parseFloat(scenarioFees[s.feeKey]) || 0;
      const totalCost = landedCostPerUnit + fee + adCostPerUnit;
      const profit = price - totalCost;
      const margin = price > 0 ? (profit / price) * 100 : 0;

      return {
        ...s,
        profit,
        margin,
        fee
      };
    });
  }, [calculations, sellingPrice, unitsOrdered, unitsSold, productCostTotal, shippingToAmazon, adSpendTotal, scenarioFees]);

  const handleReset = () => {
    setSellingPrice('29.99');
    setUnitsOrdered('500');
    setUnitsSold('450');
    setProductCostTotal('3000');
    setShippingToAmazon('800');
    setFbaFeePerUnit('5.50');
    setAdSpendTotal('900');
    setScenarioFees({ low: '5.00', mid: '5.50', high: '6.00' });
  };

  const decision = getDecision();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Amazon FBA Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Amazon Seller Toolkit – Lite
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            احسب الربحية وقيّم المنتج بسرعة واتخذ قرار ذكي
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Field 
                    label="Selling Price (USD)"
                    value={sellingPrice}
                    setValue={setSellingPrice}
                    step="0.01"
                    helpText="سعر البيع على Amazon"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Units Ordered"
                      value={unitsOrdered}
                      setValue={setUnitsOrdered}
                      prefix=""
                      helpText="عدد الوحدات المطلوبة"
                    />
                    <Field 
                      label="Units Sold"
                      value={unitsSold}
                      setValue={setUnitsSold}
                      prefix=""
                      helpText="عدد الوحدات المباعة"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Costs & Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Field 
                    label="Total Product Cost (USD)"
                    value={productCostTotal}
                    setValue={setProductCostTotal}
                    step="0.01"
                    helpText="إجمالي تكلفة المنتج"
                  />
                  <Field 
                    label="Shipping to Amazon (USD)"
                    value={shippingToAmazon}
                    setValue={setShippingToAmazon}
                    step="0.01"
                    helpText="تكلفة الشحن الكلية"
                  />
                  <Field 
                    label="FBA Fee Per Unit (USD)"
                    value={fbaFeePerUnit}
                    setValue={setFbaFeePerUnit}
                    step="0.01"
                    helpText="رسوم FBA للوحدة الواحدة"
                  />
                  <Field 
                    label="Total Ad Spend (USD)"
                    value={adSpendTotal}
                    setValue={setAdSpendTotal}
                    step="0.01"
                    helpText="إجمالي الإعلانات"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Decision Indicator */}
            {calculations.valid && decision && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className={`border-2 ${decision.color} shadow-lg`}>
                  <CardContent className={`p-6 ${decision.bgColor}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${decision.color} flex items-center justify-center`}>
                        <decision.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Decision Indicator</div>
                        <div className={`text-2xl font-bold ${decision.textColor}`}>
                          {decision.label}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Error Display */}
            {!calculations.valid && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{calculations.error}</p>
                </CardContent>
              </Card>
            )}

            {/* Main Results */}
            {calculations.valid && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Profitability Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Profit Per Unit</div>
                        <div className={`text-2xl font-bold ${calculations.profitPerUnit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${calculations.profitPerUnit.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Margin</div>
                        <div className={`text-2xl font-bold ${calculations.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {calculations.margin.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">ROI</div>
                        <div className={`text-2xl font-bold ${calculations.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {calculations.roi.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Total Cost Per Unit</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${calculations.totalCostPerUnit.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Landed Cost Per Unit:</span>
                        <span className="font-semibold">${calculations.landedCostPerUnit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Ad Cost Per Unit:</span>
                        <span className="font-semibold">${calculations.adCostPerUnit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">FBA Fee Per Unit:</span>
                        <span className="font-semibold">${parseFloat(fbaFeePerUnit).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Price Scenarios */}
            {calculations.valid && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Price Scenarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {priceScenarios.map((scenario, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold text-slate-900">{scenario.label}</div>
                              <div className="text-2xl font-bold text-indigo-600">
                                ${scenario.price}
                              </div>
                            </div>
                            <Badge className={scenario.profit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                              {scenario.margin.toFixed(1)}% Margin
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="text-xs text-slate-600 mb-1 block">FBA Fee</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={scenarioFees[scenario.feeKey]}
                                onChange={(e) => setScenarioFees(prev => ({
                                  ...prev,
                                  [scenario.feeKey]: e.target.value
                                }))}
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-600 mb-1">Profit</div>
                              <div className={`text-lg font-bold ${scenario.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ${scenario.profit.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}