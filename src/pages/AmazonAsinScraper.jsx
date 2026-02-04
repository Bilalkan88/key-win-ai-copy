import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Download, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AmazonAsinScraper() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResults(null);
      setErrors([]);
    } else {
      toast.error("يرجى اختيار ملف CSV فقط");
    }
  };

  const processCSV = async () => {
    if (!file) {
      toast.error("يرجى اختيار ملف CSV أولاً");
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("الملف فارغ أو لا يحتوي على بيانات");
        setProcessing(false);
        return;
      }

      // Parse CSV
      const parsedData = lines.slice(1).map((line, idx) => {
        const values = line.split(",").map(v => v.trim());
        return {
          lineNumber: idx + 2,
          sku: values[0] || "",
          name: values[1] || "",
          description: values[2] || "",
          colour: values[3] || "",
          size: values[4] || ""
        };
      });

      // Process in batches
      const successResults = [];
      const errorResults = [];
      const batchSize = 5;

      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        
        // Call backend function to scrape Amazon
        const response = await base44.functions.invoke("scrapeAmazonAsins", {
          products: batch
        });

        if (response.data.success) {
          successResults.push(...response.data.results);
        }
        if (response.data.errors) {
          errorResults.push(...response.data.errors);
        }

        setProgress(Math.min(((i + batchSize) / parsedData.length) * 100, 100));
      }

      setResults({
        total: parsedData.length,
        success: successResults.length,
        failed: errorResults.length,
        data: successResults
      });
      setErrors(errorResults);

      toast.success(`تمت المعالجة: ${successResults.length} نجح، ${errorResults.length} فشل`);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء المعالجة");
    } finally {
      setProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!results || results.data.length === 0) return;

    const csv = [
      ["SKU", "ASIN"],
      ...results.data.map(r => [r.sku, r.asin])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amazon_asins_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrors = () => {
    if (!errors || errors.length === 0) return;

    const csv = [
      ["Line", "SKU", "Error"],
      ...errors.map(e => [e.lineNumber, e.sku, e.message])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amazon_asins_errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-4">
            <Search className="w-4 h-4" />
            أداة مجانية
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Amazon ASIN Scraper
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            ارفع ملف CSV للبحث عن ASIN لمنتجات Amazon
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200 shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                رفع ملف CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 mb-2">
                      انقر لاختيار ملف CSV أو اسحبه هنا
                    </p>
                    <p className="text-sm text-slate-500">
                      الأعمدة المطلوبة: SKU, Name, Description, Colour, Size
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Badge variant="secondary">{(file.size / 1024).toFixed(2)} KB</Badge>
                  </div>
                )}

                <Button
                  onClick={processCSV}
                  disabled={!file || processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Search className="w-5 h-5 mr-2 animate-spin" />
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      ابدأ البحث عن ASIN
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-slate-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">تقدم المعالجة</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-slate-600 mb-2">إجمالي المنتجات</p>
                    <p className="text-3xl font-bold text-slate-900">{results.total}</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-green-600 mb-2">نجح</p>
                    <p className="text-3xl font-bold text-green-700">{results.success}</p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-red-600 mb-2">فشل</p>
                    <p className="text-3xl font-bold text-red-700">{results.failed}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={downloadResults}
                  disabled={results.data.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تنزيل النتائج ({results.success})
                </Button>
                <Button
                  onClick={downloadErrors}
                  disabled={errors.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تنزيل الأخطاء ({results.failed})
                </Button>
              </div>

              {/* Results Table */}
              {results.data.length > 0 && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      النتائج الناجحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">SKU</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">اسم المنتج</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">ASIN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.data.slice(0, 10).map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-sm">{item.sku}</td>
                              <td className="py-3 px-4 text-sm">{item.name}</td>
                              <td className="py-3 px-4">
                                <Badge className="bg-green-100 text-green-700">{item.asin}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {results.data.length > 10 && (
                        <p className="text-sm text-slate-500 mt-4 text-center">
                          عرض 10 من {results.data.length} نتيجة. قم بتنزيل الملف الكامل.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Errors Table */}
              {errors.length > 0 && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      الأخطاء
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">السطر</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">SKU</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">الخطأ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errors.slice(0, 10).map((error, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-sm">{error.lineNumber}</td>
                              <td className="py-3 px-4 text-sm">{error.sku}</td>
                              <td className="py-3 px-4 text-sm text-red-600">{error.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {errors.length > 10 && (
                        <p className="text-sm text-slate-500 mt-4 text-center">
                          عرض 10 من {errors.length} خطأ. قم بتنزيل الملف الكامل.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="border-slate-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <AlertCircle className="w-5 h-5" />
                تعليمات الاستخدام
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>• يجب أن يحتوي ملف CSV على الأعمدة التالية: SKU, Name, Description, Colour, Size</p>
              <p>• السطر الأول يجب أن يحتوي على عناوين الأعمدة</p>
              <p>• يتم البحث عن المنتجات على Amazon UK تلقائيًا</p>
              <p>• النتائج ستحتوي على SKU و ASIN المطابق</p>
              <p>• يمكنك تنزيل النتائج الناجحة والأخطاء بشكل منفصل</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}