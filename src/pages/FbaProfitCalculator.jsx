import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FbaProfitCalculator() {
  const [salePrice, setSalePrice] = useState(14.1);
  const [costPrice, setCostPrice] = useState(3.0);
  const [desiredROI, setDesiredROI] = useState(30);

  // Simple calculations
  const amazonFees = salePrice * 0.15; // 15% referral fee
  const referralFee = salePrice * 0.15;
  const fbaFee = 3.5; // Simplified FBA fee
  const storageFee = 0.37;

  const totalCost = costPrice + amazonFees + fbaFee + storageFee;
  const profit = salePrice - totalCost;
  const roi = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  // Calculate suggested cost based on desired ROI
  const suggestedCost = salePrice / (1 + desiredROI / 100) - amazonFees - fbaFee - storageFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-md mx-auto">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">PROFIT CALCULATOR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sale Price */}
            <div>
              <Label className="text-white text-sm mb-2 block">Sale Price</Label>
              <Input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="bg-white text-slate-900 border-0 h-11"
              />
            </div>

            {/* Cost Price */}
            <div>
              <Label className="text-white text-sm mb-2 block">Cost Price</Label>
              <Input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="bg-white text-slate-900 border-0 h-11"
              />
            </div>

            {/* Amazon Fees */}
            <div>
              <Label className="text-white text-sm mb-2 block">Amazon Fees</Label>
              <div className="bg-blue-400 rounded-md px-4 py-2.5 text-white font-semibold">
                ${amazonFees.toFixed(2)}
              </div>
            </div>

            {/* Referral Fee */}
            <div>
              <Label className="text-white text-sm mb-2 block">Referral Fee</Label>
              <div className="bg-blue-400 rounded-md px-4 py-2.5 text-white font-semibold">
                ${referralFee.toFixed(2)}
              </div>
            </div>

            {/* FBA Fee */}
            <div>
              <Label className="text-white text-sm mb-2 block">FBA Fee</Label>
              <div className="bg-blue-400 rounded-md px-4 py-2.5 text-white font-semibold">
                ${fbaFee.toFixed(2)}
              </div>
            </div>

            {/* Storage Fee */}
            <div>
              <Label className="text-white text-sm mb-2 block">Storage Fee</Label>
              <div className="bg-blue-400 rounded-md px-4 py-2.5 text-white font-semibold">
                ${storageFee.toFixed(2)}
              </div>
            </div>

            {/* Profit */}
            <div>
              <Label className="text-white text-sm mb-2 block">Profit</Label>
              <div className="bg-green-500 rounded-md px-4 py-2.5 text-white font-bold text-lg">
                ${profit.toFixed(2)}
              </div>
            </div>

            {/* ROI */}
            <div>
              <Label className="text-white text-sm mb-2 block">ROI</Label>
              <div className="bg-green-500 rounded-md px-4 py-2.5 text-white font-bold text-lg">
                {roi.toFixed(1)}%
              </div>
            </div>

            {/* Desired ROI */}
            <div>
              <Label className="text-white text-sm mb-2 block">Desired ROI</Label>
              <Select value={desiredROI.toString()} onValueChange={(v) => setDesiredROI(Number(v))}>
                <SelectTrigger className="bg-white text-slate-900 border-0 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Suggested Cost Price */}
            <div>
              <Label className="text-white text-sm mb-2 block">Suggested Cost Price</Label>
              <div className="bg-blue-400 rounded-md px-4 py-2.5 text-white font-semibold">
                ${suggestedCost > 0 ? suggestedCost.toFixed(2) : '0.00'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}