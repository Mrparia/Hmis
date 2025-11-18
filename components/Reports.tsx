import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bill, InventoryItem, PaymentMethod } from '../types';
import { GoogleGenAI } from '@google/genai';
import Button from './common/Button';

const DailySummaryReport: React.FC<{ selectedDate: string }> = ({ selectedDate }) => {
    const { state } = useAppContext();

    const dailyReport = useMemo(() => {
        const filteredBills = state.bills.filter(bill => bill.billDate.startsWith(selectedDate) && bill.status === 'Finalized');
        const totalSales = filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
        const totalGst = filteredBills.reduce((sum, bill) => sum + bill.totalGst, 0);
        const salesWithoutGst = totalSales - totalGst;
        return { bills: filteredBills, totalSales, totalGst, salesWithoutGst };
    }, [state.bills, selectedDate]);
    
    const gstBreakdown = useMemo(() => {
        const gstData: Record<number, { taxableValue: number; totalTax: number }> = {
            0: { taxableValue: 0, totalTax: 0 },
            5: { taxableValue: 0, totalTax: 0 },
            12: { taxableValue: 0, totalTax: 0 },
            18: { taxableValue: 0, totalTax: 0 },
            28: { taxableValue: 0, totalTax: 0 },
        };

        dailyReport.bills.forEach(bill => {
            bill.items.forEach(item => {
                if (gstData[item.gstRate] !== undefined) {
                    gstData[item.gstRate].taxableValue += item.total; // item.total is the pre-GST, post-discount value
                    gstData[item.gstRate].totalTax += item.gstAmount;
                }
            });
        });

        return Object.entries(gstData)
            .map(([rate, data]) => ({
                rate: Number(rate),
                taxableValue: data.taxableValue,
                cgst: data.totalTax / 2,
                sgst: data.totalTax / 2,
                totalTax: data.totalTax,
            }))
            .filter(item => item.taxableValue > 0 || item.totalTax > 0);

    }, [dailyReport.bills]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-4">End of Day Sales Summary for {new Date(selectedDate).toLocaleDateString('en-CA')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Total Sales (inc. GST)</p>
                    <p className="text-2xl font-bold text-blue-800">₹{dailyReport.totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-600">Sales (ex. GST)</p>
                    <p className="text-2xl font-bold text-green-800">₹{dailyReport.salesWithoutGst.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-yellow-600">Total GST Collected</p>
                    <p className="text-2xl font-bold text-yellow-800">₹{dailyReport.totalGst.toFixed(2)}</p>
                </div>
            </div>
            <h3 className="text-xl font-semibold text-primary mt-8 mb-4">Bills for the Day</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Bill ID</th>
                            <th scope="col" className="px-6 py-3">Patient Name</th>
                            <th scope="col" className="px-6 py-3">Subtotal</th>
                            <th scope="col" className="px-6 py-3">GST</th>
                            <th scope="col" className="px-6 py-3">Grand Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyReport.bills.length > 0 ? dailyReport.bills.map((bill: Bill) => (
                            <tr key={bill.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{bill.id}</td>
                                <td className="px-6 py-4">{bill.patientName}</td>
                                <td className="px-6 py-4">₹{bill.subTotal.toFixed(2)}</td>
                                <td className="px-6 py-4">₹{bill.totalGst.toFixed(2)}</td>
                                <td className="px-6 py-4 font-bold">₹{bill.grandTotal.toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No sales recorded for this date.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-semibold text-primary mt-8 mb-4">GST Summary (CGST + SGST)</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">GST Rate</th>
                            <th scope="col" className="px-6 py-3 text-right">Taxable Value</th>
                            <th scope="col" className="px-6 py-3 text-right">CGST</th>
                            <th scope="col" className="px-6 py-3 text-right">SGST</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Tax</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gstBreakdown.map(item => (
                            <tr key={item.rate} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{item.rate}%</td>
                                <td className="px-6 py-4 text-right">₹{item.taxableValue.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">₹{item.cgst.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">₹{item.sgst.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-bold">₹{item.totalTax.toFixed(2)}</td>
                            </tr>
                        ))}
                         {gstBreakdown.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No GST data for this date.</td></tr>
                        )}
                    </tbody>
                     <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td className="px-6 py-4">Total</td>
                            <td className="px-6 py-4 text-right">₹{gstBreakdown.reduce((sum, item) => sum + item.taxableValue, 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">₹{gstBreakdown.reduce((sum, item) => sum + item.cgst, 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">₹{gstBreakdown.reduce((sum, item) => sum + item.sgst, 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">₹{gstBreakdown.reduce((sum, item) => sum + item.totalTax, 0).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

const CollectionReport: React.FC<{ selectedDate: string }> = ({ selectedDate }) => {
    const { state } = useAppContext();
    const paymentMethods: PaymentMethod[] = ['Cash', 'Card', 'UPI', 'Insurance'];
    const serviceCategories: InventoryItem['category'][] = ['Medicine', 'General', 'Pathology', 'Radiology', 'Consumable'];
    const categoryDisplayNames: Record<InventoryItem['category'], string> = {
        Medicine: 'Pharmacy',
        General: 'Consultation',
        Pathology: 'Pathology',
        Radiology: 'Radiology',
        Consumable: 'Consumables',
    };

    const collectionData = useMemo(() => {
        const filteredBills = state.bills.filter(bill => bill.billDate.startsWith(selectedDate) && bill.status === 'Finalized');
        
        const initialData: Record<PaymentMethod, Record<InventoryItem['category'], number>> = {
            Cash: { Medicine: 0, General: 0, Pathology: 0, Radiology: 0, Consumable: 0 },
            Card: { Medicine: 0, General: 0, Pathology: 0, Radiology: 0, Consumable: 0 },
            UPI: { Medicine: 0, General: 0, Pathology: 0, Radiology: 0, Consumable: 0 },
            Insurance: { Medicine: 0, General: 0, Pathology: 0, Radiology: 0, Consumable: 0 },
        };

        const collectionsByCategory = filteredBills.reduce((acc, bill) => {
            bill.items.forEach(item => {
                const itemTotal = item.total + item.gstAmount; 
                if (acc[bill.paymentMethod] && acc[bill.paymentMethod][item.category] !== undefined) {
                    acc[bill.paymentMethod][item.category] += itemTotal;
                }
            });
            return acc;
        }, initialData);

        const totalsByPaymentMethod = paymentMethods.map(method => {
            const categoryValues = serviceCategories.reduce((obj, cat) => {
                obj[cat] = collectionsByCategory[method][cat];
                return obj;
            }, {} as Record<InventoryItem['category'], number>);

            return {
                method,
                ...categoryValues,
                total: serviceCategories.reduce((sum, cat) => sum + collectionsByCategory[method][cat], 0)
            }
        });
        
        const categoryTotals = serviceCategories.reduce((acc, cat) => {
            acc[cat] = totalsByPaymentMethod.reduce((sum, item) => sum + item[cat], 0);
            return acc;
        }, {} as Record<InventoryItem['category'], number>);

        const totalRevenue = totalsByPaymentMethod.reduce((sum, item) => sum + item.total, 0);

        return { totalsByPaymentMethod, categoryTotals, totalRevenue };

    }, [state.bills, selectedDate]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Payment Collection Report for {new Date(selectedDate).toLocaleDateString('en-CA')}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-gray-50">Payment Method</th>
                            {serviceCategories.map(cat => (
                                <th scope="col" className="px-6 py-3 text-right" key={cat}>{categoryDisplayNames[cat]}</th>
                            ))}
                            <th scope="col" className="px-6 py-3 text-right font-bold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collectionData.totalsByPaymentMethod.map(row => (
                            <tr key={row.method} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">{row.method}</td>
                                {serviceCategories.map(cat => (
                                    <td key={cat} className="px-6 py-4 text-right">₹{row[cat].toFixed(2)}</td>
                                ))}
                                <td className="px-6 py-4 text-right font-semibold">₹{row.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td className="px-6 py-4 text-lg text-primary sticky left-0 bg-gray-100">Category Totals</td>
                             {serviceCategories.map(cat => (
                                <td key={cat} className="px-6 py-4 text-right text-lg text-primary">₹{collectionData.categoryTotals[cat].toFixed(2)}</td>
                            ))}
                            <td className="px-6 py-4 text-right text-lg text-primary">₹{collectionData.totalRevenue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

const AIAnalyzer: React.FC = () => {
    const { state } = useAppContext();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleGenerateInsights = async () => {
        setIsLoading(true);
        setError('');
        setResponse('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // Prepare a subset of data for context
            const relevantData = {
                last7DaysBills: state.bills.slice(0, 50), // Limit data for context size
                inventorySummary: state.inventory.map(item => ({
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    totalStock: item.batches.reduce((sum, b) => sum + b.stock, 0)
                })).slice(0, 50),
                patientVisitsToday: state.patientVisits.filter(v => v.checkInTime.startsWith(new Date().toISOString().split('T')[0]))
            };

            const systemInstruction = `You are a hospital data analyst AI. Analyze the provided JSON data to answer the user's query. Provide concise, data-driven insights. The data includes recent bills, an inventory summary, and today's patient visits. Structure your response in clear, readable markdown.`;

            const fullPrompt = `${systemInstruction}\n\nUser Query: "${query}"\n\nJSON Data:\n${JSON.stringify(relevantData)}`;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 32768,
                    },
                },
            });

            setResponse(result.text);

        } catch (e) {
            console.error(e);
            setError('Failed to generate insights. Please check your API key and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-4">AI-Powered Analytical Insights</h2>
            <p className="mb-4 text-gray-600">Ask complex questions about your hospital's data. The AI will analyze recent trends and provide insights using an advanced reasoning model.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What was our best selling medicine category this week? or Analyze today's patient footfall and suggest staffing adjustments."
                    rows={4}
                    className="w-full p-2 border rounded-md"
                    disabled={isLoading}
                />
                <div className="flex justify-end mt-2">
                    <Button onClick={handleGenerateInsights} disabled={isLoading || !query}>
                        {isLoading ? 'Analyzing...' : 'Generate Insights'}
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="mt-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-600">Thinking... this may take a moment for complex queries.</p>
                </div>
            )}

            {error && <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            
            {response && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Analysis Result</h3>
                    <div className="bg-white p-4 border rounded-lg">
                        <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">{response}</div>
                    </div>
                </div>
            )}
        </div>
    );
};


const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'collection' | 'ai'>('summary');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex">
                    <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'summary' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Daily Sales Summary</button>
                    <button onClick={() => setActiveTab('collection')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'collection' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Collection Report</button>
                    <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'ai' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI Insights
                        </span>
                    </button>
                </div>
                { activeTab !== 'ai' &&
                    <div className="flex items-center space-x-4">
                        <label htmlFor="report-date" className="font-medium text-gray-700">Select Date:</label>
                        <input 
                            type="date" 
                            id="report-date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                }
            </div>
            
            {activeTab === 'summary' && <DailySummaryReport selectedDate={selectedDate} />}
            {activeTab === 'collection' && <CollectionReport selectedDate={selectedDate} />}
            {activeTab === 'ai' && <AIAnalyzer />}
        </div>
    </div>
  );
};

export default Reports;