import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, RefreshCw, Globe } from "lucide-react";
import { motion } from "framer-motion";

const translations = {
  en: {
    title: "Amazon FBA Profit Calculator",
    inputs: "Inputs",
    results: "Results",
    unitsOrdered: "Units Ordered",
    unitsSold: "Units Sold",
    retailPrice: "Retail Price (USD)",
    totalCOGS: "Total COGS (USD)",
    shippingToAmazon: "Shipping to Amazon (USD)",
    extraShipping: "Extra Shipping (USD)",
    fbaFeePerUnit: "FBA Fee per Unit (USD)",
    totalAdSpend: "Total Ad Spend (USD)",
    promotionPerUnit: "Promotion per Unit (USD)",
    otherPerUnit: "Other per Unit (USD)",
    reset: "Reset",
    landedCost: "Landed cost / unit",
    adSpend: "Ad spend / unit",
    totalCost: "Total cost / unit",
    netProfit: "Net profit / unit",
    netMargin: "Net margin",
    roi: "ROI",
    pricePoints: "Price Points",
    price: "Price",
    fbaFee: "FBA Fee",
    costPerUnit: "Cost/Unit",
    profitPerUnit: "Profit/Unit",
    margin: "Margin",
    warnUnits: "⚠️ Units Ordered cannot be 0",
    warnPrice: "⚠️ Retail Price cannot be 0",
  },
  ar: {
    title: "حاسبة أرباح أمازون FBA",
    inputs: "المدخلات",
    results: "النتائج",
    unitsOrdered: "عدد الوحدات (Ordered)",
    unitsSold: "عدد الوحدات المباعة (Sold)",
    retailPrice: "سعر البيع (USD)",
    totalCOGS: "إجمالي COGS (USD)",
    shippingToAmazon: "الشحن إلى أمازون (USD)",
    extraShipping: "شحن إضافي (USD)",
    fbaFeePerUnit: "رسوم FBA لكل وحدة (USD)",
    totalAdSpend: "إجمالي الإنفاق الإعلاني (USD)",
    promotionPerUnit: "Promotion لكل وحدة (USD)",
    otherPerUnit: "Other لكل وحدة (USD)",
    reset: "إعادة ضبط",
    landedCost: "Landed cost / unit",
    adSpend: "Ad spend / unit",
    totalCost: "Total cost / unit",
    netProfit: "Net profit / unit",
    netMargin: "Net margin",
    roi: "ROI",
    pricePoints: "نقاط السعر",
    price: "السعر",
    fbaFee: "FBA fee",
    costPerUnit: "التكلفة/وحدة",
    profitPerUnit: "الربح/وحدة",
    margin: "الهامش",
    warnUnits: "⚠️ عدد الوحدات Ordered لا يمكن أن يكون 0",
    warnPrice: "⚠️ سعر البيع لا يمكن أن يكون 0",
  },
};

export default function AmazonFbaProfitCalculator() {
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const [unitsOrdered, setUnitsOrdered] = useState(500);
  const [unitsSold, setUnitsSold] = useState(175);
  const [retailPrice, setRetailPrice] = useState(29.99);
  const [totalCOGS, setTotalCOGS] = useState(1800);
  const [shippingToAmazon, setShippingToAmazon] = useState(800);
  const [extraShipping, setExtraShipping] = useState(0);
  const [fbaFeePerUnit, setFbaFeePerUnit] = useState(15.15);
  const [totalAdSpend, setTotalAdSpend] = useState(500);
  const [promotionPerUnit, setPromotionPerUnit] = useState(0);
  const [otherPerUnit, setOtherPerUnit] = useState(0);

  const [pricePoints, setPricePoints] = useState([
    { price: 19.99, fbaFee: 13.2 },
    { price: 25.99, fbaFee: 13.8 },
    { price: 33.0, fbaFee: 14.05 },
  ]);

  const money = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
      Number.isFinite(n) ? n : 0
    );

  const calc = useMemo(() => {
    const uo = Number(unitsOrdered) || 0;
    const us = Number(unitsSold) || 0;

    const price = Number(retailPrice) || 0;
    const cogs = Number(totalCOGS) || 0;
    const ship = (Number(shippingToAmazon) || 0) + (Number(extraShipping) || 0);
    const fba = Number(fbaFeePerUnit) || 0;
    const adsTotal = Number(totalAdSpend) || 0;
    const promo = Number(promotionPerUnit) || 0;
    const other = Number(otherPerUnit) || 0;

    const landedTotal = cogs + ship;
    const landedPerUnit = uo > 0 ? landedTotal / uo : 0;
    const adPerUnit = us > 0 ? adsTotal / us : 0;

    const totalCostPerUnit = landedPerUnit + fba + adPerUnit + promo + other;
    const netProfitPerUnit = price - totalCostPerUnit;

    const netMargin = price > 0 ? netProfitPerUnit / price : 0;
    const roi = landedPerUnit > 0 ? netProfitPerUnit / landedPerUnit : 0;

    return {
      landedPerUnit,
      adPerUnit,
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
    promotionPerUnit,
    otherPerUnit,
  ]);

  const rows = useMemo(() => {
    const promo = Number(promotionPerUnit) || 0;
    const other = Number(otherPerUnit) || 0;

    return pricePoints.map((r, idx) => {
      const price = Number(r.price) || 0;
      const fba = Number(r.fbaFee) || 0;

      const totalCostPerUnit = calc.landedPerUnit + calc.adPerUnit + promo + other + fba;
      const netProfitPerUnit = price - totalCostPerUnit;
      const netMargin = price > 0 ? netProfitPerUnit / price : 0;

      return { idx, price, fba, totalCostPerUnit, netProfitPerUnit, netMargin };
    });
  }, [pricePoints, calc.landedPerUnit, calc.adPerUnit, promotionPerUnit, otherPerUnit]);

  const reset = () => {
    setUnitsOrdered(500);
    setUnitsSold(175);
    setRetailPrice(29.99);
    setTotalCOGS(1800);
    setShippingToAmazon(800);
    setExtraShipping(0);
    setFbaFeePerUnit(15.15);
    setTotalAdSpend(500);
    setPromotionPerUnit(0);
    setOtherPerUnit(0);
    setPricePoints([
      { price: 19.99, fbaFee: 13.2 },
      { price: 25.99, fbaFee: 13.8 },
      { price: 33.0, fbaFee: 14.05 },
    ]);
  };

  const warnUnits = (Number(unitsOrdered) || 0) === 0;
  const warnPrice = (Number(retailPrice) || 0) === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium">
              <Calculator className="w-4 h-4" />
              Free Tool
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              {lang === "en" ? "عربي" : "English"}
            </Button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            {t.title}
          </h1>
        </motion.div>

        {/* Main Calculator */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-slate-900">{t.inputs}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Field label={t.unitsOrdered} value={unitsOrdered} onChange={setUnitsOrdered} />
                <Field label={t.unitsSold} value={unitsSold} onChange={setUnitsSold} />
                <Field label={t.retailPrice} value={retailPrice} onChange={setRetailPrice} step="0.01" />
                <Field label={t.totalCOGS} value={totalCOGS} onChange={setTotalCOGS} step="0.01" />
                <Field label={t.shippingToAmazon} value={shippingToAmazon} onChange={setShippingToAmazon} step="0.01" />
                <Field label={t.extraShipping} value={extraShipping} onChange={setExtraShipping} step="0.01" />
                <Field label={t.fbaFeePerUnit} value={fbaFeePerUnit} onChange={setFbaFeePerUnit} step="0.01" />
                <Field label={t.totalAdSpend} value={totalAdSpend} onChange={setTotalAdSpend} step="0.01" />
                <Field label={t.promotionPerUnit} value={promotionPerUnit} onChange={setPromotionPerUnit} step="0.01" />
                <Field label={t.otherPerUnit} value={otherPerUnit} onChange={setOtherPerUnit} step="0.01" />

                <Button onClick={reset} variant="outline" className="w-full mt-6">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.reset}
                </Button>

                {warnUnits && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    {t.warnUnits}
                  </div>
                )}
                {warnPrice && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    {t.warnPrice}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-slate-900">{t.results}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <KPI label={t.landedCost} value={money(calc.landedPerUnit)} />
                  <KPI label={t.adSpend} value={money(calc.adPerUnit)} />
                  <KPI label={t.totalCost} value={money(calc.totalCostPerUnit)} />
                  <KPI
                    label={t.netProfit}
                    value={money(calc.netProfitPerUnit)}
                    highlight={calc.netProfitPerUnit > 0}
                  />
                  <KPI label={t.netMargin} value={`${(calc.netMargin * 100).toFixed(2)}%`} />
                  <KPI label={t.roi} value={`${(calc.roi * 100).toFixed(2)}%`} border={false} />
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
              <CardTitle className="text-slate-900">{t.pricePoints}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className={`py-3 px-4 text-sm font-semibold text-slate-700 ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {t.price}
                      </th>
                      <th className={`py-3 px-4 text-sm font-semibold text-slate-700 ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {t.fbaFee}
                      </th>
                      <th className={`py-3 px-4 text-sm font-semibold text-slate-700 ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {t.costPerUnit}
                      </th>
                      <th className={`py-3 px-4 text-sm font-semibold text-slate-700 ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {t.profitPerUnit}
                      </th>
                      <th className={`py-3 px-4 text-sm font-semibold text-slate-700 ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {t.margin}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
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
                        <td className="py-3 px-4 text-slate-700">{money(r.totalCostPerUnit)}</td>
                        <td className={`py-3 px-4 font-semibold ${r.netProfitPerUnit > 0 ? "text-green-600" : "text-red-600"}`}>
                          {money(r.netProfitPerUnit)}
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

function Field({ label, value, onChange, step = "1" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
      />
    </div>
  );
}

function KPI({ label, value, highlight = false, border = true }) {
  return (
    <div className={`flex justify-between items-center py-3 ${border ? "border-b border-slate-100" : ""}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-semibold text-lg ${highlight ? "text-green-600" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}