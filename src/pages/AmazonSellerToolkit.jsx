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
  Sparkles,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FeeCalc } from 'amazon-fba-calc';

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
  // Form State - Comprehensive
  const [numberOfUnits, setNumberOfUnits] = useState('500');
  const [costPerUnit, setCostPerUnit] = useState('6.00');
  const [shippingCost, setShippingCost] = useState('800');
  const [importDuty, setImportDuty] = useState('150');
  const [additionalUpfrontCost, setAdditionalUpfrontCost] = useState('200');
  const [shippingToAmazonWH, setShippingToAmazonWH] = useState('300');
  const [storageFee, setStorageFee] = useState('0.50');
  const [noOfStorageMonths, setNoOfStorageMonths] = useState('3');
  const [amazonShippingFee, setAmazonShippingFee] = useState('5.50');
  const [amazonSalesFee, setAmazonSalesFee] = useState('15');
  const [advertisingCost, setAdvertisingCost] = useState('1.80');
  const [retailPrice, setRetailPrice] = useState('29.99');

  // FBA Fee Calculator State
  const [dimensions, setDimensions] = useState({ length: '10', width: '8', height: '6' });
  const [weight, setWeight] = useState('1.5');
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  
  // UI State
  const [showResults, setShowResults] = useState(false);

  // Comprehensive Calculations
  const calculations = useMemo(() => {
    const units = parseFloat(numberOfUnits) || 0;
    const cost = parseFloat(costPerUnit) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const duty = parseFloat(importDuty) || 0;
    const upfront = parseFloat(additionalUpfrontCost) || 0;
    const whShipping = parseFloat(shippingToAmazonWH) || 0;
    const storage = parseFloat(storageFee) || 0;
    const months = parseFloat(noOfStorageMonths) || 0;
    const amazonShip = parseFloat(amazonShippingFee) || 0;
    const salesFee = parseFloat(amazonSalesFee) || 0;
    const adCost = parseFloat(advertisingCost) || 0;
    const retail = parseFloat(retailPrice) || 0;

    if (units === 0 || retail === 0) {
      return { error: 'Number of units and retail price cannot be zero', valid: false };
    }

    // Total Unit Cost (TUC)
    const totalUnitCost = cost + ((shipping + duty + upfront + whShipping) / units);

    // Total Amazon Cost (TAC)
    const totalAmazonCost = (storage * months) + amazonShip + ((retail * salesFee) / 100) + adCost;

    // Totals
    const totalCost = totalUnitCost + totalAmazonCost;
    const netProfit = retail - totalCost;
    const profitMargin = (netProfit / retail) * 100;

    // Breakdown for display
    const breakdown = [
      { label: 'Cost Per Unit', perUnit: cost, total: cost * units },
      { label: 'Shipping Cost', perUnit: shipping / units, total: shipping },
      { label: 'Import Duty', perUnit: duty / units, total: duty },
      { label: 'Additional Upfront Cost', perUnit: upfront / units, total: upfront },
      { label: 'Shipping to Amazon WH', perUnit: whShipping / units, total: whShipping },
      { label: 'Total Unit Cost', perUnit: totalUnitCost, total: totalUnitCost * units, highlight: true },
      { label: 'Storage Fee', perUnit: storage * months, total: storage * months * units },
      { label: 'Amazon Shipping Fee', perUnit: amazonShip, total: amazonShip * units },
      { label: 'Amazon Sales Fee', perUnit: (retail * salesFee) / 100, total: ((retail * salesFee) / 100) * units },
      { label: 'Advertising Cost', perUnit: adCost, total: adCost * units },
      { label: 'Total Amazon Cost', perUnit: totalAmazonCost, total: totalAmazonCost * units, highlight: true },
      { label: 'Retail Price', perUnit: retail, total: retail * units, highlight: true },
      { label: 'Total Cost', perUnit: totalCost, total: totalCost * units, highlight: true },
      { label: 'Net Profit', perUnit: netProfit, total: netProfit * units, highlight: true, profit: true },
      { label: 'Profit Margin (%)', perUnit: profitMargin, total: profitMargin, highlight: true, percent: true }
    ];

    return {
      valid: true,
      totalUnitCost,
      totalAmazonCost,
      totalCost,
      netProfit,
      profitMargin,
      breakdown,
      units
    };
  }, [numberOfUnits, costPerUnit, shippingCost, importDuty, additionalUpfrontCost, 
      shippingToAmazonWH, storageFee, noOfStorageMonths, amazonShippingFee, 
      amazonSalesFee, advertisingCost, retailPrice]);

  // Decision Indicator
  const getDecision = () => {
    if (!calculations.valid) return null;
    
    const { profitMargin, netProfit } = calculations;
    
    if (profitMargin >= 30 && netProfit >= 10) {
      return {
        label: 'Excellent Product',
        color: 'bg-emerald-500',
        icon: CheckCircle,
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      };
    } else if (profitMargin >= 15 && profitMargin < 30) {
      return {
        label: 'Average Product',
        color: 'bg-yellow-500',
        icon: AlertCircle,
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    } else {
      return {
        label: 'Not Recommended',
        color: 'bg-red-500',
        icon: XCircle,
        textColor: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }
  };

  const handleCalculateFBAFee = async () => {
    setIsCalculatingFee(true);
    try {
      const feeCalculator = new FeeCalc();
      const dims = [
        parseFloat(dimensions.length) || 0,
        parseFloat(dimensions.width) || 0,
        parseFloat(dimensions.height) || 0
      ];
      const weightInLbs = parseFloat(weight) || 0;
      
      const fee = await feeCalculator.calculateFBAFee(dims, weightInLbs);
      setAmazonShippingFee(fee.toFixed(2));
    } catch (error) {
      console.error('Error calculating FBA fee:', error);
      alert('Failed to calculate FBA fee. Please check your inputs.');
    } finally {
      setIsCalculatingFee(false);
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleReset = () => {
    setNumberOfUnits('500');
    setCostPerUnit('6.00');
    setShippingCost('800');
    setImportDuty('150');
    setAdditionalUpfrontCost('200');
    setShippingToAmazonWH('300');
    setStorageFee('0.50');
    setNoOfStorageMonths('3');
    setAmazonShippingFee('5.50');
    setAmazonSalesFee('15');
    setAdvertisingCost('1.80');
    setRetailPrice('29.99');
    setDimensions({ length: '10', width: '8', height: '6' });
    setWeight('1.5');
    setShowResults(false);
  };

  const formatNumber = (num) => {
    return parseFloat(num).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
            Calculate profitability, evaluate products quickly, and make smart decisions
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
                    Product & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Field 
                    label="Number of Units"
                    value={numberOfUnits}
                    setValue={setNumberOfUnits}
                    prefix=""
                    helpText="Total units in this order"
                  />
                  <Field 
                    label="Retail Price (USD)"
                    value={retailPrice}
                    setValue={setRetailPrice}
                    step="0.01"
                    helpText="Selling price on Amazon"
                  />
                  <Field 
                    label="Cost Per Unit (USD)"
                    value={costPerUnit}
                    setValue={setCostPerUnit}
                    step="0.01"
                    helpText="Manufacturing/purchase cost per unit"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Upfront Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Field 
                    label="Shipping Cost (USD)"
                    value={shippingCost}
                    setValue={setShippingCost}
                    step="0.01"
                    helpText="Total shipping cost from supplier"
                  />
                  <Field 
                    label="Import Duty (USD)"
                    value={importDuty}
                    setValue={setImportDuty}
                    step="0.01"
                    helpText="Customs/import fees"
                  />
                  <Field 
                    label="Additional Upfront Cost (USD)"
                    value={additionalUpfrontCost}
                    setValue={setAdditionalUpfrontCost}
                    step="0.01"
                    helpText="Any other upfront expenses"
                  />
                  <Field 
                    label="Shipping to Amazon Warehouse (USD)"
                    value={shippingToAmazonWH}
                    setValue={setShippingToAmazonWH}
                    step="0.01"
                    helpText="Cost to ship to FBA warehouse"
                  />
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
                    <Package className="w-5 h-5 text-indigo-600" />
                    Amazon Fees & Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Storage Fee (USD/month)"
                      value={storageFee}
                      setValue={setStorageFee}
                      step="0.01"
                      helpText="Per unit monthly storage"
                    />
                    <Field 
                      label="Storage Months"
                      value={noOfStorageMonths}
                      setValue={setNoOfStorageMonths}
                      prefix=""
                      helpText="Months in storage"
                    />
                  </div>
                  <Field 
                    label="Amazon Shipping Fee (USD)"
                    value={amazonShippingFee}
                    setValue={setAmazonShippingFee}
                    step="0.01"
                    helpText="FBA fulfillment fee per unit"
                  />
                  <Field 
                    label="Amazon Sales Fee (%)"
                    value={amazonSalesFee}
                    setValue={setAmazonSalesFee}
                    step="0.1"
                    prefix=""
                    helpText="Referral fee percentage"
                  />
                  <Field 
                    label="Advertising Cost (USD)"
                    value={advertisingCost}
                    setValue={setAdvertisingCost}
                    step="0.01"
                    helpText="PPC cost per unit"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-indigo-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Auto Calculate FBA Fee
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Field 
                      label="Length (in)"
                      value={dimensions.length}
                      setValue={(val) => setDimensions(prev => ({ ...prev, length: val }))}
                      step="0.1"
                      prefix=""
                    />
                    <Field 
                      label="Width (in)"
                      value={dimensions.width}
                      setValue={(val) => setDimensions(prev => ({ ...prev, width: val }))}
                      step="0.1"
                      prefix=""
                    />
                    <Field 
                      label="Height (in)"
                      value={dimensions.height}
                      setValue={(val) => setDimensions(prev => ({ ...prev, height: val }))}
                      step="0.1"
                      prefix=""
                    />
                  </div>
                  <Field 
                    label="Weight (lbs)"
                    value={weight}
                    setValue={setWeight}
                    step="0.1"
                    prefix=""
                    helpText="Product weight in pounds"
                  />
                  <Button
                    onClick={handleCalculateFBAFee}
                    disabled={isCalculatingFee}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isCalculatingFee ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Auto-Calculate & Set Fee
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Updates Amazon Shipping Fee above
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex gap-4">
              <Button
                onClick={handleCalculate}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Decision Indicator */}
            {showResults && calculations.valid && decision && (
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
            {showResults && !calculations.valid && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{calculations.error}</p>
                </CardContent>
              </Card>
            )}

            {/* Placeholder when no results */}
            {!showResults && (
              <Card className="border-slate-200 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Ready to Calculate
                  </h3>
                  <p className="text-slate-600">
                    Fill in the fields and click Calculate to see your profitability analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Summary KPIs */}
            {showResults && calculations.valid && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Summary for {calculations.units} Units
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Net Profit/Unit</div>
                        <div className={`text-2xl font-bold ${calculations.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${formatNumber(calculations.netProfit)}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Total Profit</div>
                        <div className={`text-2xl font-bold ${calculations.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${formatNumber(calculations.netProfit * calculations.units)}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Profit Margin</div>
                        <div className={`text-2xl font-bold ${calculations.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {calculations.profitMargin.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Total Cost/Unit</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${formatNumber(calculations.totalCost)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Detailed Breakdown */}
            {showResults && calculations.valid && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Detailed Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      {calculations.breakdown.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex justify-between py-2 text-sm ${
                            item.highlight ? 'border-t-2 border-slate-300 pt-3 mt-3 font-semibold' : ''
                          } ${item.profit ? (calculations.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700') : ''}`}
                        >
                          <span className={item.highlight ? 'text-slate-900' : 'text-slate-600'}>
                            {item.label}:
                          </span>
                          <div className="text-right">
                            <div className={item.highlight ? 'font-bold' : ''}>
                              {item.percent ? `${item.perUnit.toFixed(1)}%` : `$${formatNumber(item.perUnit)}`}
                            </div>
                            {!item.percent && (
                              <div className="text-xs text-slate-500">
                                Total: ${formatNumber(item.total)}
                              </div>
                            )}
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