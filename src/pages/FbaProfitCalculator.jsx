import React, { useMemo, useState } from "react";

/**
 * Amazon US FBA Profit Calculator (Tabs)
 * - Uses: US 2026 FBA fulfillment fee table (excluding apparel) + Storage fee table + Disposal fee table
 * - Referral: flat + tiered (configurable)
 * - Tabs: Product / Costs / Amazon Fees (Advanced) / Results
 *
 * NOTE: Auto size-tier detection from dimensions requires official size-tier rules (not provided yet),
 * so tier is selected manually for now.
 */

// ---------------- Config ----------------

// Referral fee rules (add/expand from your Amazon table)
const REFERRAL_FEES_US = {
  "Everything Else": { type: "flat", rate: 0.15, min: 0.30 },
  "Home & Kitchen": { type: "flat", rate: 0.15, min: 0.30 },
  "Toys & Games": { type: "flat", rate: 0.15, min: 0.30 },
  "Tools & Home Improvement": { type: "flat", rate: 0.15, min: 0.30 },
  "Consumer Electronics": { type: "flat", rate: 0.08, min: 0.30 },

  Watches: {
    type: "tiered",
    min: 0.30,
    tiers: [
      { upTo: 1500, rate: 0.16 },
      { rate: 0.03 },
    ],
  },

  Jewelry: {
    type: "tiered",
    min: 0.30,
    tiers: [
      { upTo: 250, rate: 0.20 },
      { rate: 0.05 },
    ],
  },
};

// Storage total monthly fee per cubic foot (non-dangerous), from your table
const STORAGE_TOTAL_MONTHLY_FEE_PER_CUFT_US = {
  JAN_SEP: {
    STANDARD: [
      { maxWeeks: 22, fee: 0.78 },
      { maxWeeks: 28, fee: 1.22 },
      { maxWeeks: 36, fee: 1.54 },
      { maxWeeks: 44, fee: 1.94 },
      { maxWeeks: 52, fee: 2.36 },
      { maxWeeks: Infinity, fee: 2.66 },
    ],
    OVERSIZE: [
      { maxWeeks: 22, fee: 0.56 },
      { maxWeeks: 28, fee: 0.79 },
      { maxWeeks: 36, fee: 1.02 },
      { maxWeeks: 44, fee: 1.19 },
      { maxWeeks: 52, fee: 1.32 },
      { maxWeeks: Infinity, fee: 1.82 },
    ],
  },
  OCT_DEC: {
    STANDARD: [
      { maxWeeks: 22, fee: 2.40 },
      { maxWeeks: 28, fee: 2.84 },
      { maxWeeks: 36, fee: 3.16 },
      { maxWeeks: 44, fee: 3.56 },
      { maxWeeks: 52, fee: 3.98 },
      { maxWeeks: Infinity, fee: 4.28 },
    ],
    OVERSIZE: [
      { maxWeeks: 22, fee: 1.40 },
      { maxWeeks: 28, fee: 1.63 },
      { maxWeeks: 36, fee: 1.86 },
      { maxWeeks: 44, fee: 2.03 },
      { maxWeeks: 52, fee: 2.16 },
      { maxWeeks: Infinity, fee: 2.66 },
    ],
  },
};

// Disposal fees (US)
const DISPOSAL_FEES_2026_US = {
  STANDARD: [
    { max: 0.5, fee: 1.04 },
    { max: 1.0, fee: 1.53 },
    { max: 2.0, fee: 2.27 },
    { max: Infinity, feeFn: (w) => 2.89 + (w - 2) * 1.06 },
  ],
  BULKY_XL: [
    { max: 1.0, fee: 3.12 },
    { max: 2.0, fee: 4.30 },
    { max: 4.0, fee: 6.36 },
    { max: 10.0, fee: 10.04 },
    { max: Infinity, feeFn: (w) => 14.32 + (w - 10) * 1.06 },
  ],
};

// Fulfillment fees (US) starting Jan 15, 2026 (excluding apparel), from your screenshots
const FBA_FULFILLMENT_FEES_US_2026 = {
  SMALL_STANDARD: [
    { maxWeight: 2, unit: "oz", fees: { "<10": 2.43, "10-50": 3.32, ">50": 3.58 } },
    { maxWeight: 4, unit: "oz", fees: { "<10": 2.49, "10-50": 3.42, ">50": 3.68 } },
    { maxWeight: 6, unit: "oz", fees: { "<10": 2.56, "10-50": 3.45, ">50": 3.71 } },
    { maxWeight: 8, unit: "oz", fees: { "<10": 2.66, "10-50": 3.54, ">50": 3.80 } },
    { maxWeight: 10, unit: "oz", fees: { "<10": 2.77, "10-50": 3.68, ">50": 3.94 } },
    { maxWeight: 12, unit: "oz", fees: { "<10": 2.82, "10-50": 3.78, ">50": 4.04 } },
    { maxWeight: 14, unit: "oz", fees: { "<10": 2.92, "10-50": 3.91, ">50": 4.17 } },
    { maxWeight: 16, unit: "oz", fees: { "<10": 2.95, "10-50": 3.96, ">50": 4.22 } },
  ],
  LARGE_STANDARD: [
    { maxWeight: 0.25, unit: "lb", fees: { "<10": 2.91, "10-50": 3.73, ">50": 3.99 } },
    { maxWeight: 0.5, unit: "lb", fees: { "<10": 3.13, "10-50": 3.95, ">50": 4.21 } },
    { maxWeight: 0.75, unit: "lb", fees: { "<10": 3.38, "10-50": 4.20, ">50": 4.46 } },
    { maxWeight: 1, unit: "lb", fees: { "<10": 3.78, "10-50": 4.60, ">50": 4.86 } },
    { maxWeight: 1.25, unit: "lb", fees: { "<10": 4.22, "10-50": 5.04, ">50": 5.30 } },
    { maxWeight: 1.5, unit: "lb", fees: { "<10": 4.60, "10-50": 5.42, ">50": 5.68 } },
    { maxWeight: 1.75, unit: "lb", fees: { "<10": 4.75, "10-50": 5.57, ">50": 5.83 } },
    { maxWeight: 2, unit: "lb", fees: { "<10": 5.00, "10-50": 5.82, ">50": 6.08 } },
    { maxWeight: 2.25, unit: "lb", fees: { "<10": 5.10, "10-50": 5.92, ">50": 6.18 } },
    { maxWeight: 2.5, unit: "lb", fees: { "<10": 5.28, "10-50": 6.10, ">50": 6.36 } },
    { maxWeight: 2.75, unit: "lb", fees: { "<10": 5.44, "10-50": 6.26, ">50": 6.52 } },
    {
      maxWeight: Infinity,
      unit: "lb",
      fees: { "<10": 6.15, "10-50": 6.97, ">50": 7.23 },
      extra: { after: 3, step: 4, stepUnit: "oz", add: 0.08 },
    },
  ],
  SMALL_BULKY: [
    {
      maxWeight: Infinity,
      unit: "lb",
      fees: { "<10": 6.78, "10-50": 7.55, ">50": 7.55 },
      extra: { after: 1, step: 1, stepUnit: "lb", add: 0.38 },
    },
  ],
  LARGE_BULKY: [
    {
      maxWeight: Infinity,
      unit: "lb",
      fees: { "<10": 8.58, "10-50": 9.35, ">50": 9.35 },
      extra: { after: 1, step: 1, stepUnit: "lb", add: 0.38 },
    },
  ],
  EXTRA_LARGE: [
    {
      maxWeight: 50,
      unit: "lb",
      fees: { "<10": 25.56, "10-50": 26.33, ">50": 26.33 },
      extra: { after: 1, step: 1, stepUnit: "lb", add: 0.38 },
    },
    {
      maxWeight: 70,
      unit: "lb",
      fees: { "<10": 39.35, "10-50": 37.32, ">50": 37.32 },
      extra: { after: 51, step: 1, stepUnit: "lb", add: 0.75 },
    },
    {
      maxWeight: 150,
      unit: "lb",
      fees: { "<10": 54.04, "10-50": 51.32, ">50": 51.32 },
      extra: { after: 71, step: 1, stepUnit: "lb", add: 0.75 },
    },
    {
      maxWeight: Infinity,
      unit: "lb",
      fees: { "<10": 194.18, "10-50": 194.95, ">50": 194.95 },
      extra: { after: 151, step: 1, stepUnit: "lb", add: 0.19 },
    },
  ],
};

// ---------------- Helpers ----------------
function clamp(n) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function cubicFeetFromInches(l, w, h) {
  return (l * w * h) / 1728;
}
function calcReferralFee(totalSalesPrice, rule) {
  if (totalSalesPrice <= 0) return 0;
  if (rule.type === "flat") return Math.max(totalSalesPrice * rule.rate, rule.min);

  let fee = 0;
  let remaining = totalSalesPrice;
  for (const tier of rule.tiers) {
    if (remaining <= 0) break;
    const portion = tier.upTo ? Math.min(remaining, tier.upTo) : remaining;
    fee += portion * tier.rate;
    remaining -= portion;
  }
  return Math.max(fee, rule.min ?? 0);
}
function calcStorageFeePerUnitPerMonth(cubicFeet, weeks, season, group) {
  const tiers = STORAGE_TOTAL_MONTHLY_FEE_PER_CUFT_US[season][group];
  const tier = tiers.find((t) => weeks <= t.maxWeeks) ?? tiers[tiers.length - 1];
  return cubicFeet * tier.fee;
}
function roundShippingWeight(weight, unit) {
  return unit === "oz" ? Math.ceil(weight) : Math.ceil(weight * 4) / 4; // 0.25 lb
}
function priceBand(price) {
  return price < 10 ? "<10" : price <= 50 ? "10-50" : ">50";
}
function calcFulfillmentFeeUS2026(tier, shippingWeightLb, sellPrice) {
  const band = priceBand(sellPrice);
  const rows = FBA_FULFILLMENT_FEES_US_2026[tier];

  for (const row of rows) {
    const w = row.unit === "oz" ? roundShippingWeight(shippingWeightLb * 16, "oz") : roundShippingWeight(shippingWeightLb, "lb");
    if (w <= row.maxWeight) {
      let fee = row.fees[band];

      if (row.extra) {
        const wBase = w; // in row.unit
        if (wBase > row.extra.after) {
          const extraWeight = wBase - row.extra.after;

          const steps =
            row.extra.stepUnit === "oz"
              ? Math.ceil((row.unit === "oz" ? extraWeight : extraWeight * 16) / row.extra.step)
              : Math.ceil((row.unit === "lb" ? extraWeight : extraWeight / 16) / row.extra.step);

          fee += steps * row.extra.add;
        }
      }

      return fee;
    }
  }
  return 0;
}
function roundWeightForDisposal(weightLb, tier) {
  return tier === "STANDARD" ? Math.ceil(weightLb * 10) / 10 : Math.ceil(weightLb);
}
function calcDisposalFeeUS2026(unitWeightLb, tier) {
  const rounded = roundWeightForDisposal(unitWeightLb, tier);
  const table = DISPOSAL_FEES_2026_US[tier];
  for (const row of table) {
    if (rounded <= row.max) {
      const fee = "feeFn" in row ? row.feeFn(rounded) : row.fee;
      return { roundedWeightLb: rounded, fee };
    }
  }
  return { roundedWeightLb: rounded, fee: 0 };
}
function tierToStorageGroup(t) {
  return t === "SMALL_STANDARD" || t === "LARGE_STANDARD" ? "STANDARD" : "OVERSIZE";
}
function tierToDisposalTier(t) {
  return t === "SMALL_STANDARD" || t === "LARGE_STANDARD" ? "STANDARD" : "BULKY_XL";
}

// ---------------- UI ----------------

export default function AmazonFBAProfitCalculatorTabs() {
  const [tab, setTab] = useState("PRODUCT");
  const [inputs, setInputs] = useState({
    marketplace: "Amazon US",
    category: "Everything Else",
    sellPrice: 43.95,

    lengthIn: 10,
    widthIn: 6,
    heightIn: 2,

    unitWeightLb: 1,
    dimensionalWeightLb: 1,
    useDimWeightOverride: false,

    fulfillmentTier: "LARGE_STANDARD",
    season: "JAN_SEP",
    storageWeeks: 20,

    manufacturingCost: 11.63,
    advertisingCost: 0,

    shippingCostPerShipment: 0,
    unitsPerShipment: 1,

    inboundPlacementFeePerUnit: 0,
    lowInventoryFeePerUnit: 0,
    longTermStorageFeePerUnit: 0,
    variableClosingFeePerUnit: 0,
    removalFeePerUnit: 0,
    liquidationFeePerUnit: 0,
    couponFeePerUnit: 0,
    importFeeDepositPerUnit: 0,
    digitalServicesFeePerUnit: 0,

    includeDisposalFee: false,

    expectedMonthlySales: 50,
  });

  function set(k, v) {
    setInputs((p) => ({ ...p, [k]: v }));
  }

  const results = useMemo(() => {
    const sellPrice = clamp(inputs.sellPrice);

    // shipping weight = max(unit weight, dim weight)
    const unitW = clamp(inputs.unitWeightLb);
    const dimW = inputs.useDimWeightOverride
      ? clamp(inputs.dimensionalWeightLb)
      : clamp((inputs.lengthIn * inputs.widthIn * inputs.heightIn) / 139); // default divisor placeholder

    const shippingWeightLb = Math.max(unitW, dimW);

    const cubicFeet = cubicFeetFromInches(inputs.lengthIn, inputs.widthIn, inputs.heightIn);

    const referralRule = REFERRAL_FEES_US[inputs.category] ?? REFERRAL_FEES_US["Everything Else"];
    const referralFee = calcReferralFee(sellPrice, referralRule);

    const fulfillmentFee = calcFulfillmentFeeUS2026(inputs.fulfillmentTier, shippingWeightLb, sellPrice);

    const storageGroup = tierToStorageGroup(inputs.fulfillmentTier);
    const storageFee = calcStorageFeePerUnitPerMonth(cubicFeet, clamp(inputs.storageWeeks), inputs.season, storageGroup);

    const inboundShippingPerUnit =
      inputs.shippingCostPerShipment > 0 && inputs.unitsPerShipment > 0
        ? clamp(inputs.shippingCostPerShipment) / clamp(inputs.unitsPerShipment)
        : 0;

    const disposal = inputs.includeDisposalFee
      ? calcDisposalFeeUS2026(unitW, tierToDisposalTier(inputs.fulfillmentTier))
      : { roundedWeightLb: unitW, fee: 0 };

    const advancedFees =
      clamp(inputs.inboundPlacementFeePerUnit) +
      clamp(inputs.lowInventoryFeePerUnit) +
      clamp(inputs.longTermStorageFeePerUnit) +
      clamp(inputs.variableClosingFeePerUnit) +
      clamp(inputs.removalFeePerUnit) +
      clamp(inputs.liquidationFeePerUnit) +
      clamp(inputs.couponFeePerUnit) +
      clamp(inputs.digitalServicesFeePerUnit);

    const amazonFees = referralFee + fulfillmentFee + storageFee + disposal.fee + advancedFees;

    const costPerUnit =
      clamp(inputs.manufacturingCost) +
      clamp(inputs.advertisingCost) +
      inboundShippingPerUnit +
      amazonFees;

    const netPerUnit = sellPrice - costPerUnit;
    const marginPct = sellPrice > 0 ? (netPerUnit / sellPrice) * 100 : 0;
    const roiPct = costPerUnit > 0 ? (netPerUnit / costPerUnit) * 100 : 0;

    const monthlyNet = netPerUnit * clamp(inputs.expectedMonthlySales);

    // Import fee deposit is tracked separately by default (not counted in margin unless you choose)
    const importFeeDeposit = clamp(inputs.importFeeDepositPerUnit);

    return {
      sellPrice: round2(sellPrice),
      unitW: round2(unitW),
      dimW: round2(dimW),
      shippingWeightLb: round2(shippingWeightLb),
      cubicFeet: round2(cubicFeet),

      referralFee: round2(referralFee),
      fulfillmentFee: round2(fulfillmentFee),
      storageFee: round2(storageFee),
      disposalFee: round2(disposal.fee),
      advancedFees: round2(advancedFees),

      amazonFees: round2(amazonFees),
      inboundShippingPerUnit: round2(inboundShippingPerUnit),

      costPerUnit: round2(costPerUnit),
      netPerUnit: round2(netPerUnit),
      marginPct: round2(marginPct),
      roiPct: round2(roiPct),
      monthlyNet: round2(monthlyNet),

      importFeeDeposit: round2(importFeeDeposit),
      storageGroup,
    };
  }, [inputs]);

  const box = { border: "1px solid #eee", borderRadius: 14, padding: 14, background: "#fff" };
  const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" };
  const label = { fontSize: 12, opacity: 0.75, marginBottom: 6 };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Amazon US FBA Profit Calculator (2026)</h2>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Tabs: Product / Costs / Amazon Fees (Advanced) / Results
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TabButton active={tab === "PRODUCT"} onClick={() => setTab("PRODUCT")}>Product</TabButton>
          <TabButton active={tab === "COSTS"} onClick={() => setTab("COSTS")}>Costs</TabButton>
          <TabButton active={tab === "AMAZON_FEES"} onClick={() => setTab("AMAZON_FEES")}>Amazon Fees</TabButton>
          <TabButton active={tab === "RESULTS"} onClick={() => setTab("RESULTS")}>Results</TabButton>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {tab === "PRODUCT" && (
        <div style={box}>
          <h3 style={{ marginTop: 0 }}>Product</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Marketplace</div>
              <input style={input} value={inputs.marketplace} disabled />
            </div>

            <div>
              <div style={label}>Category (Referral fee)</div>
              <select style={input} value={inputs.category} onChange={(e) => set("category", e.target.value)}>
                {Object.keys(REFERRAL_FEES_US).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={label}>Sell price</div>
              <input style={input} type="number" value={inputs.sellPrice} onChange={(e) => set("sellPrice", Number(e.target.value))} />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Length (in)</div>
              <input style={input} type="number" value={inputs.lengthIn} onChange={(e) => set("lengthIn", Number(e.target.value))} />
            </div>
            <div>
              <div style={label}>Width (in)</div>
              <input style={input} type="number" value={inputs.widthIn} onChange={(e) => set("widthIn", Number(e.target.value))} />
            </div>
            <div>
              <div style={label}>Height (in)</div>
              <input style={input} type="number" value={inputs.heightIn} onChange={(e) => set("heightIn", Number(e.target.value))} />
            </div>
            <div>
              <div style={label}>Unit weight (lb)</div>
              <input style={input} type="number" value={inputs.unitWeightLb} onChange={(e) => set("unitWeightLb", Number(e.target.value))} />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Fulfillment tier (manual)</div>
              <select style={input} value={inputs.fulfillmentTier} onChange={(e) => set("fulfillmentTier", e.target.value)}>
                <option value="SMALL_STANDARD">Small standard</option>
                <option value="LARGE_STANDARD">Large standard</option>
                <option value="SMALL_BULKY">Small bulky</option>
                <option value="LARGE_BULKY">Large bulky</option>
                <option value="EXTRA_LARGE">Extra-large</option>
              </select>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Auto-tier من الأبعاد يحتاج قواعد Amazon الرسمية (يمكن إضافتها لاحقًا).
              </div>
            </div>

            <div>
              <div style={label}>Season (storage)</div>
              <select style={input} value={inputs.season} onChange={(e) => set("season", e.target.value)}>
                <option value="JAN_SEP">Jan – Sep</option>
                <option value="OCT_DEC">Oct – Dec</option>
              </select>
            </div>

            <div>
              <div style={label}>Storage age (weeks)</div>
              <input style={input} type="number" value={inputs.storageWeeks} onChange={(e) => set("storageWeeks", Number(e.target.value))} />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Use dimensional weight override</div>
              <select style={input} value={inputs.useDimWeightOverride ? "yes" : "no"} onChange={(e) => set("useDimWeightOverride", e.target.value === "yes")}>
                <option value="no">No (auto from dims)</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <div style={label}>Dimensional weight (lb)</div>
              <input
                style={input}
                type="number"
                value={inputs.dimensionalWeightLb}
                disabled={!inputs.useDimWeightOverride}
                onChange={(e) => set("dimensionalWeightLb", Number(e.target.value))}
              />
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Auto dim-weight uses divisor 139 (يمكن تغييره حسب جدول Amazon الرسمي عندك).
              </div>
            </div>

            <div>
              <div style={label}>Expected monthly sales</div>
              <input style={input} type="number" value={inputs.expectedMonthlySales} onChange={(e) => set("expectedMonthlySales", Number(e.target.value))} />
            </div>

            <div>
              <div style={label}>Include Disposal fee</div>
              <select style={input} value={inputs.includeDisposalFee ? "yes" : "no"} onChange={(e) => set("includeDisposalFee", e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === "COSTS" && (
        <div style={box}>
          <h3 style={{ marginTop: 0 }}>Costs</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Manufacturing cost (per unit)</div>
              <input style={input} type="number" value={inputs.manufacturingCost} onChange={(e) => set("manufacturingCost", Number(e.target.value))} />
            </div>

            <div>
              <div style={label}>Advertising (per unit)</div>
              <input style={input} type="number" value={inputs.advertisingCost} onChange={(e) => set("advertisingCost", Number(e.target.value))} />
            </div>

            <div>
              <div style={label}>Inbound shipping cost (per shipment)</div>
              <input style={input} type="number" value={inputs.shippingCostPerShipment} onChange={(e) => set("shippingCostPerShipment", Number(e.target.value))} />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Units per shipment</div>
              <input style={input} type="number" value={inputs.unitsPerShipment} onChange={(e) => set("unitsPerShipment", Number(e.target.value))} />
            </div>

            <div style={{ alignSelf: "end", fontSize: 12, opacity: 0.75 }}>
              Inbound shipping per unit = Shipment cost ÷ Units per shipment
            </div>
          </div>
        </div>
      )}

      {tab === "AMAZON_FEES" && (
        <div style={box}>
          <h3 style={{ marginTop: 0 }}>Amazon Fees (Advanced)</h3>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: -6, marginBottom: 12 }}>
            أدخلها "per unit" (كما يفعل Revenue Calculator عندما تضيف خيارات إضافية).
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Num label="Inbound placement fee / unit" value={inputs.inboundPlacementFeePerUnit} onChange={(v) => set("inboundPlacementFeePerUnit", v)} />
            <Num label="Low inventory fee / unit" value={inputs.lowInventoryFeePerUnit} onChange={(v) => set("lowInventoryFeePerUnit", v)} />
            <Num label="Long-term storage fee / unit" value={inputs.longTermStorageFeePerUnit} onChange={(v) => set("longTermStorageFeePerUnit", v)} />

            <Num label="Variable closing fee / unit" value={inputs.variableClosingFeePerUnit} onChange={(v) => set("variableClosingFeePerUnit", v)} />
            <Num label="Removal fee / unit" value={inputs.removalFeePerUnit} onChange={(v) => set("removalFeePerUnit", v)} />
            <Num label="Liquidation fee / unit" value={inputs.liquidationFeePerUnit} onChange={(v) => set("liquidationFeePerUnit", v)} />

            <Num label="Coupon fee / unit" value={inputs.couponFeePerUnit} onChange={(v) => set("couponFeePerUnit", v)} />
            <Num label="Digital services fee / unit" value={inputs.digitalServicesFeePerUnit} onChange={(v) => set("digitalServicesFeePerUnit", v)} />
            <Num label="Import fee deposit / unit (tracked separately)" value={inputs.importFeeDepositPerUnit} onChange={(v) => set("importFeeDepositPerUnit", v)} />
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
            ملاحظة: Import fee deposit عادةً يتم عرضه/تتبعه منفصلًا، لذلك لا ندخله في Margin افتراضيًا.
          </div>
        </div>
      )}

      {tab === "RESULTS" && (
        <div style={box}>
          <h3 style={{ marginTop: 0 }}>Results</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h4 style={{ marginTop: 0 }}>Weights & Volume</h4>
              <KV k="Unit weight (lb)" v={results.unitW} />
              <KV k="Dim weight (lb)" v={results.dimW} />
              <KV k="Shipping weight (lb)" v={results.shippingWeightLb} />
              <KV k="Cubic feet" v={results.cubicFeet} />
              <KV k="Storage group" v={results.storageGroup} />
              <KV k="Expected monthly sales" v={inputs.expectedMonthlySales} />
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h4 style={{ marginTop: 0 }}>Fee Breakdown (per unit)</h4>
              <KV k="Referral fee" v={`$${results.referralFee}`} />
              <KV k="Fulfillment fee (2026)" v={`$${results.fulfillmentFee}`} />
              <KV k="Monthly storage fee" v={`$${results.storageFee}`} />
              <KV k="Disposal fee" v={`$${results.disposalFee}`} />
              <KV k="Advanced fees total" v={`$${results.advancedFees}`} />
              <KV k="Amazon fees (total)" v={`$${results.amazonFees}`} strong />
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h4 style={{ marginTop: 0 }}>Cost per unit</h4>
              <KV k="Manufacturing" v={`$${round2(inputs.manufacturingCost)}`} />
              <KV k="Advertising" v={`$${round2(inputs.advertisingCost)}`} />
              <KV k="Inbound shipping / unit" v={`$${results.inboundShippingPerUnit}`} />
              <KV k="Amazon fees / unit" v={`$${results.amazonFees}`} />
              <hr style={{ border: 0, borderTop: "1px solid #eee" }} />
              <KV k="Cost per unit" v={`$${results.costPerUnit}`} strong />
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                Import fee deposit (optional): <b>${results.importFeeDeposit}</b>
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h4 style={{ marginTop: 0 }}>Profit</h4>
              <KV k="Sell price" v={`$${results.sellPrice}`} />
              <KV k="Net profit / unit" v={`$${results.netPerUnit}`} strong />
              <KV k="Margin" v={`${results.marginPct}%`} strong />
              <KV k="ROI" v={`${results.roiPct}%`} />
              <hr style={{ border: 0, borderTop: "1px solid #eee" }} />
              <KV k="Net profit / month" v={`$${results.monthlyNet}`} strong />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: active ? "#111827" : "#fff",
        color: active ? "#fff" : "#111827",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function KV({ k, v, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, margin: "8px 0" }}>
      <div style={{ opacity: 0.75 }}>{k}</div>
      <div style={{ fontWeight: strong ? 800 : 650 }}>{String(v)}</div>
    </div>
  );
}

function Num({ label, value, onChange }) {
  const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" };
  const l = { fontSize: 12, opacity: 0.75, marginBottom: 6 };
  return (
    <div>
      <div style={l}>{label}</div>
      <input style={input} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}