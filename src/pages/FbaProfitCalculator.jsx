import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calculator } from "lucide-react";
import { motion } from "framer-motion";

export default function FbaProfitCalculator() {
  const [unitsOrdered, setUnitsOrdered] = useState(500);
  const [unitsSold, setUnitsSold] = useState(175);
  const [retailPrice, setRetailPrice] = useState(29.99);
  const [totalCOGS, setTotalCOGS] = useState(1800);
  const [shippingToAmazon, setShippingToAmazon] = useState(800);
  const [extraShipping, setExtraShipping] = useState(0);
  const [fbaFeePerUnit, setFbaFeePerUnit] = useState(15.15);
  const [totalAdSpend, setTotalAdSpend] = useState(500);
  const [giveawayFeePerUnit, setGiveawayFeePerUnit] = useState(0);

  const [pricePoints, setPricePoints] = useState([
    { price: 19.99, fbaFee: 13.2 },
    { price: 25.99, fbaFee: 13.8 },
    { price: 33.0, fbaFee: 14.05 },
  ]);

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
      Number.isFinite(n) ? n : 0
    );

  const calc = useMemo(() => {
    const safeUnitsOrdered = Number(unitsOrdered) || 0;
    const safeUnitsSold = Number(unitsSold) || 0;
    const safeRetail = Number(retailPrice) || 0;
    const safeCOGS = Number(totalCOGS) || 0;
    const safeShip = (Number(shippingToAmazon) || 0) + (Number(extraShipping) || 0);

    const cogsPerUnit = safeUnitsOrdered > 0 ? safeCOGS / safeUnitsOrdered : 0;
    const landedCostTotal = safeCOGS + safeShip;
    const landedCostPerUnit = safeUnitsOrdered > 0 ? landedCostTotal / safeUnitsOrdered : 0;
    const adSpendPerUnit = safeUnitsSold > 0 ? (Number(totalAdSpend) || 0) / safeUnitsSold : 0;
    const totalCostPerUnit =
      landedCostPerUnit + (Number(fbaFeePerUnit) || 0) + adSpendPerUnit + (Number(giveawayFeePerUnit) || 0);
    const netProfitPerUnit = safeRetail - totalCostPerUnit;
    const netMargin = safeRetail > 0 ? netProfitPerUnit / safeRetail : 0;
    const roi = landedCostPerUnit > 0 ? netProfitPerUnit / landedCostPerUnit : 0;

    return {
      cogsPerUnit,
      landedCostPerUnit,
      adSpendPerUnit,
      totalCostPerUnit,
      netProfitPerUnit,
      netMargin,
      roi,
    };
  }, [
    unitsOrdered,
    unitsSold,
    retailPrice,
    totalCOGS,
    shippingToAmazon,
    extraShipping,
    fbaFeePerUnit,
    totalAdSpend,
    giveawayFeePerUnit,
  ]);

  const pricePointRows = useMemo(() => {
    const safeRetailInputs = {
      landedCostPerUnit: calc.landedCostPerUnit,
      adSpendPerUnit: calc.adSpendPerUnit,
      giveawayFeePerUnit: Number(giveawayFeePerUnit) || 0,
    };

    return pricePoints.map((p, idx) => {
      const price = Number(p.price) || 0;
      const fba = Number(p.fbaFee) || 0;
      const totalCostPerUnit =
        safeRetailInputs.landedCostPerUnit + safeRetailInputs.adSpendPerUnit + safeRetailInputs.giveawayFeePerUnit + fba;
      const netProfitPerUnit = price - totalCostPerUnit;
      const netMargin = price > 0 ? netProfitPerUnit / price : 0;

      return { idx, price, fba, totalCostPerUnit, netProfitPerUnit, netMargin };
    });
  }, [pricePoints, calc.landedCostPerUnit, calc.adSpendPerUnit, giveawayFeePerUnit]);

  const reset = () => {
    setUnitsOrdered(500);
    setUnitsSold(175);
    setRetailPrice(29.99);
    setTotalCOGS(1800);
    setShippingToAmazon(800);
    setExtraShipping(0);
    setFbaFeePerUnit(15.15);
    setTotalAdSpend(500);
    setGiveawayFeePerUnit(0);
    setPricePoints([
      { price: 19.99, fbaFee: 13.2 },
      { price: 25.99, fbaFee: 13.8 },
      { price: 33.0, fbaFee: 14.05 },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
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
            Amazon FBA Profit Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Calculate your Amazon FBA profits with precision and explore different pricing scenarios
          </p>
        </motion.div>

        {/* Main Calculator */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-slate-900">Input Parameters</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Field label="Units ordered" value={unitsOrdered} setValue={setUnitsOrdered} />
                <Field label="Units sold" value={unitsSold} setValue={setUnitsSold} />
                <Field label="Retail price (USD)" value={retailPrice} setValue={setRetailPrice} step="0.01" />
                <Field label="Total COGS (USD)" value={totalCOGS} setValue={setTotalCOGS} step="0.01" />
                <Field label="Shipping to Amazon (USD)" value={shippingToAmazon} setValue={setShippingToAmazon} step="0.01" />
                <Field label="Extra shipping (USD)" value={extraShipping} setValue={setExtraShipping} step="0.01" />
                <Field label="FBA fee per unit (USD)" value={fbaFeePerUnit} setValue={setFbaFeePerUnit} step="0.01" />
                <Field label="Total ad spend (USD)" value={totalAdSpend} setValue={setTotalAdSpend} step="0.01" />
                <Field label="Giveaway fee per unit (USD)" value={giveawayFeePerUnit} setValue={setGiveawayFeePerUnit} step="0.01" />

                <Button onClick={reset} variant="outline" className="w-full mt-6">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>

                {(Number(unitsOrdered) || 0) === 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    ⚠️ Units ordered cannot be 0.
                  </div>
                )}
                {(Number(retailPrice) || 0) === 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    ⚠️ Retail price cannot be 0.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-slate-900">Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <KPI label="Landed cost / unit" value={fmtMoney(calc.landedCostPerUnit)} />
                  <KPI label="Ad spend / unit" value={fmtMoney(calc.adSpendPerUnit)} />
                  <KPI label="Total cost / unit" value={fmtMoney(calc.totalCostPerUnit)} />
                  <KPI 
                    label="Net profit / unit" 
                    value={fmtMoney(calc.netProfitPerUnit)}
                    highlight={calc.netProfitPerUnit > 0}
                  />
                  <KPI label="Net margin" value={`${(calc.netMargin * 100).toFixed(2)}%`} />
                  <KPI label="ROI" value={`${(calc.roi * 100).toFixed(2)}%`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Price Points Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="text-slate-900">Price Point Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Retail Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">FBA Fee</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Total Cost / Unit</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Net Profit / Unit</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Net Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricePointRows.map((r) => (
                      <tr key={r.idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            step="0.01"
                            value={r.price}
                            onChange={(e) => {
                              const next = [...pricePoints];
                              next[r.idx] = { ...next[r.idx], price: Number(e.target.value) };
                              setPricePoints(next);
                            }}
                            className="w-32"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            step="0.01"
                            value={r.fba}
                            onChange={(e) => {
                              const next = [...pricePoints];
                              next[r.idx] = { ...next[r.idx], fbaFee: Number(e.target.value) };
                              setPricePoints(next);
                            }}
                            className="w-32"
                          />
                        </td>
                        <td className="py-3 px-4 text-slate-700">{fmtMoney(r.totalCostPerUnit)}</td>
                        <td className={`py-3 px-4 font-semibold ${r.netProfitPerUnit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {fmtMoney(r.netProfitPerUnit)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{`${(r.netMargin * 100).toFixed(2)}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, value, setValue, step = "1" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
      />
    </div>
  );
}

function KPI({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-semibold text-lg ${highlight ? 'text-green-600' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}