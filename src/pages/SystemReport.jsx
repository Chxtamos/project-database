import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  AlertTriangle,
  BarChart3,
  CheckSquare,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  Search,
  Star,
  Users,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const formatMoney = (value) => `฿${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (value) => Number(value || 0).toLocaleString();
const reportDate = () => new Date().toLocaleString();

const printSectionOptions = [
  { id: 'metrics', label: 'Executive Metrics' },
  { id: 'summary', label: 'Management Summary' },
  { id: 'topMovies', label: 'Top Rated Movies' },
  { id: 'revenueTrend', label: 'Revenue Trend' },
  { id: 'genres', label: 'Genre Mix' },
  { id: 'pendingPayments', label: 'Pending Payment Work Queue' },
];

const SystemReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    stats: {},
    topMovies: [],
    revenueTrend: [],
    genres: [],
    pendingPayments: [],
    reviews: [],
  });
  const [printSections, setPrintSections] = useState(
    printSectionOptions.reduce((sections, option) => ({ ...sections, [option.id]: true }), {})
  );

  const fetchReport = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const requests = [
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/dashboard/top-movies?limit=5`, { headers }),
        fetch(`${API_BASE}/dashboard/revenue-trend`, { headers }),
        fetch(`${API_BASE}/dashboard/genres`, { headers }),
        fetch(`${API_BASE}/payments?status=0&limit=10`, { headers }),
        fetch(`${API_BASE}/reviews?limit=10`, { headers }),
      ];

      const [statsRes, moviesRes, revenueRes, genresRes, paymentsRes, reviewsRes] = await Promise.all(requests);
      const [stats, topMovies, revenueTrend, genres, pendingPayments, reviews] = await Promise.all([
        statsRes.json(),
        moviesRes.json(),
        revenueRes.json(),
        genresRes.json(),
        paymentsRes.json(),
        reviewsRes.json(),
      ]);

      setReport({
        stats: stats.success ? stats.data : {},
        topMovies: topMovies.success ? topMovies.data : [],
        revenueTrend: revenueTrend.success ? revenueTrend.data : [],
        genres: genres.success ? genres.data : [],
        pendingPayments: pendingPayments.success ? pendingPayments.data : [],
        reviews: reviews.success ? reviews.data : [],
      });
    } catch (err) {
      console.error('Fetch system report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const executiveMetrics = useMemo(() => {
    const stats = report.stats || {};
    const paymentTotal = Number(stats.total_payments || 0);
    const successCount = Number(stats.success_count || 0);
    const approvalRate = paymentTotal > 0 ? (successCount / paymentTotal) * 100 : 0;
    const failedCount = Number(stats.failed_count || 0);
    const pendingCount = Number(stats.pending_count || 0);

    return [
      {
        label: 'Total Revenue',
        value: formatMoney(stats.total_revenue),
        insight: 'Approved payments only',
        status: Number(stats.total_revenue || 0) > 0 ? 'Healthy' : 'Watch',
        icon: DollarSign,
      },
      {
        label: 'Total Users',
        value: formatNumber(stats.total_users),
        insight: 'Registered accounts',
        status: Number(stats.total_users || 0) > 0 ? 'Active' : 'Empty',
        icon: Users,
      },
      {
        label: 'Movie Catalog',
        value: formatNumber(stats.total_movies),
        insight: `Average rating ${Number(stats.avg_rating || 0).toFixed(1)}/5`,
        status: Number(stats.total_movies || 0) > 0 ? 'Online' : 'Empty',
        icon: BarChart3,
      },
      {
        label: 'Payment Approval',
        value: `${approvalRate.toFixed(1)}%`,
        insight: `${pendingCount} pending, ${failedCount} rejected`,
        status: pendingCount > 0 ? 'Needs Review' : 'Stable',
        icon: AlertTriangle,
      },
      {
        label: 'Total Reviews',
        value: formatNumber(stats.total_reviews),
        insight: 'User feedback volume',
        status: Number(stats.total_reviews || 0) > 0 ? 'Engaged' : 'Low',
        icon: Star,
      },
    ];
  }, [report.stats]);

  const reportRows = useMemo(() => {
    const topMovie = report.topMovies[0];
    const bestGenre = report.genres[0];
    const latestRevenue = report.revenueTrend[report.revenueTrend.length - 1];

    return [
      {
        metric: 'Top Rated Movie',
        value: topMovie ? `${topMovie.movie_name} (${topMovie.movie_rating || 'N/A'}/5)` : 'No data',
        ownerView: 'Shows the strongest title for promotion and homepage placement.',
        status: topMovie ? 'Actionable' : 'No Data',
      },
      {
        metric: 'Revenue This Period',
        value: latestRevenue ? formatMoney(latestRevenue.revenue) : formatMoney(0),
        ownerView: 'Tracks recent cash flow from approved payments.',
        status: Number(latestRevenue?.revenue || 0) > 0 ? 'Healthy' : 'Watch',
      },
      {
        metric: 'Pending Payments',
        value: `${report.pendingPayments.length} waiting approvals`,
        ownerView: 'Operations should approve or reject these to unlock library access.',
        status: report.pendingPayments.length > 0 ? 'Needs Review' : 'Clear',
      },
      {
        metric: 'Most Supplied Genre',
        value: bestGenre ? `${bestGenre.genre_name} (${bestGenre.movie_count} movies)` : 'No data',
        ownerView: 'Useful for catalog balance and purchasing decisions.',
        status: bestGenre ? 'Informative' : 'No Data',
      },
      {
        metric: 'Review Activity',
        value: `${formatNumber(report.stats.total_reviews)} total reviews`,
        ownerView: 'Indicates user engagement and content quality feedback.',
        status: Number(report.stats.total_reviews || 0) > 0 ? 'Engaged' : 'Low',
      },
    ];
  }, [report]);

  const filteredRows = reportRows.filter(row =>
    row.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPrintCount = Object.values(printSections).filter(Boolean).length;

  const togglePrintSection = (sectionId) => {
    setPrintSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const selectAllPrintSections = () => {
    setPrintSections(printSectionOptions.reduce((sections, option) => ({ ...sections, [option.id]: true }), {}));
  };

  const buildReportHtml = () => {
    const metricRows = executiveMetrics.map(metric => `
      <tr>
        <td>${metric.label}</td>
        <td>${metric.value}</td>
        <td>${metric.insight}</td>
        <td>${metric.status}</td>
      </tr>
    `).join('');

    const summaryRows = reportRows.map(row => `
      <tr>
        <td>${row.metric}</td>
        <td>${row.value}</td>
        <td>${row.ownerView}</td>
        <td>${row.status}</td>
      </tr>
    `).join('');

    const movieRows = report.topMovies.map((movie, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${movie.movie_name}</td>
        <td>${movie.movie_rating || 'N/A'}</td>
        <td>${movie.review_count || 0}</td>
        <td>${formatMoney(movie.movie_cost)}</td>
      </tr>
    `).join('');

    const revenueRows = report.revenueTrend.map(item => `
      <tr>
        <td>${item.month}</td>
        <td>${formatMoney(item.revenue)}</td>
        <td>${item.success_count}</td>
      </tr>
    `).join('');

    const pendingRows = report.pendingPayments.map(payment => `
      <tr>
        <td>#${payment.payment_id}</td>
        <td>${payment.username || payment.email || '-'}</td>
        <td>${formatMoney(payment.amount)}</td>
        <td>${payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</td>
      </tr>
    `).join('');

    const genreRows = report.genres.slice(0, 8).map(item => `
      <tr>
        <td>${item.genre_name}</td>
        <td>${item.movie_count}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>FilmHub Executive System Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 28px; }
            h1 { margin: 0 0 4px; font-size: 24px; }
            h2 { margin: 28px 0 10px; font-size: 16px; }
            p { color: #6b7280; margin: 0 0 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
            th { background: #f3f4f6; color: #374151; text-align: left; }
            th, td { border: 1px solid #e5e7eb; padding: 9px 10px; font-size: 12px; }
            .muted { color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>FilmHub Executive System Report</h1>
          <p>Generated: ${reportDate()}</p>
          ${printSections.metrics ? `<h2>Executive Metrics</h2><table><thead><tr><th>Metric</th><th>Value</th><th>Insight</th><th>Status</th></tr></thead><tbody>${metricRows}</tbody></table>` : ''}
          ${printSections.summary ? `<h2>Management Summary</h2><table><thead><tr><th>Metric</th><th>Value</th><th>Owner View</th><th>Status</th></tr></thead><tbody>${summaryRows}</tbody></table>` : ''}
          ${printSections.topMovies ? `<h2>Top Rated Movies</h2><table><thead><tr><th>#</th><th>Movie</th><th>Rating</th><th>Reviews</th><th>Price</th></tr></thead><tbody>${movieRows || '<tr><td colspan="5">No data</td></tr>'}</tbody></table>` : ''}
          ${printSections.revenueTrend ? `<h2>Revenue Trend</h2><table><thead><tr><th>Month</th><th>Revenue</th><th>Successful Payments</th></tr></thead><tbody>${revenueRows || '<tr><td colspan="3">No data</td></tr>'}</tbody></table>` : ''}
          ${printSections.genres ? `<h2>Genre Mix</h2><table><thead><tr><th>Genre</th><th>Movie Count</th></tr></thead><tbody>${genreRows || '<tr><td colspan="2">No data</td></tr>'}</tbody></table>` : ''}
          ${printSections.pendingPayments ? `<h2>Pending Payment Work Queue</h2><table><thead><tr><th>Payment</th><th>Customer</th><th>Amount</th><th>Date</th></tr></thead><tbody>${pendingRows || '<tr><td colspan="4">No pending payments</td></tr>'}</tbody></table>` : ''}
          <p class="muted">This report is generated from live FilmHub database APIs.</p>
        </body>
      </html>
    `;
  };

  const printReport = () => {
    if (selectedPrintCount === 0) return;
    const win = window.open('', '_blank', 'width=1100,height=800');
    if (!win) return;
    win.document.write(buildReportHtml());
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  const exportPdf = () => {
    printReport();
  };

  const exportExcel = () => {
    const excelHtml = `\uFEFF${buildReportHtml()}`;
    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filmhub-system-report-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout pageTitle="System Reports" pageDescription="Executive analytics for owners and management.">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="animate-spin mb-3" size={36} />
          <p>Loading system report...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Executive Report</h2>
              <p className="text-xs text-gray-500 mt-1">Generated {reportDate()} from live platform data.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search report rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm"
                />
              </div>
              <button
                onClick={exportPdf}
                disabled={selectedPrintCount === 0}
                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileText size={18} /> Export to PDF
              </button>
              <button
                onClick={exportExcel}
                disabled={selectedPrintCount === 0}
                className="px-4 py-2.5 bg-green-50 text-green-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={18} /> Export to Excel
              </button>
              <button
                onClick={printReport}
                disabled={selectedPrintCount === 0}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer size={18} /> Print
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">Print Selection</h2>
                  <p className="text-xs text-gray-500 mt-1">{selectedPrintCount} of {printSectionOptions.length} sections selected for print and PDF export.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={selectAllPrintSections}
                className="self-start lg:self-auto px-3 py-2 text-sm font-bold text-figma-blue bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Select All
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {printSectionOptions.map(option => (
                <label key={option.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 cursor-pointer hover:border-figma-blue hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={Boolean(printSections[option.id])}
                    onChange={() => togglePrintSection(option.id)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {executiveMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-figma-blue flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400">{metric.status}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase">{metric.label}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{metric.insight}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <BarChart3 size={20} className="text-figma-blue" />
              <h2 className="text-lg font-black text-gray-900">Management Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Metric</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">What Owner Should See</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map(row => (
                    <tr key={row.metric} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{row.metric}</td>
                      <td className="px-6 py-4 text-gray-700">{row.value}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xl">{row.ownerView}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-50 text-figma-blue">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ReportTable
              title="Top Rated Movies"
              headers={['#', 'Movie', 'Rating', 'Reviews', 'Price']}
              rows={report.topMovies.map((movie, index) => [
                index + 1,
                movie.movie_name,
                movie.movie_rating || 'N/A',
                movie.review_count || 0,
                formatMoney(movie.movie_cost),
              ])}
            />
            <ReportTable
              title="Revenue Trend"
              headers={['Month', 'Revenue', 'Successful Payments']}
              rows={report.revenueTrend.map(item => [
                item.month,
                formatMoney(item.revenue),
                item.success_count,
              ])}
            />
            <ReportTable
              title="Genre Mix"
              headers={['Genre', 'Movie Count']}
              rows={report.genres.slice(0, 8).map(item => [item.genre_name, item.movie_count])}
            />
            <ReportTable
              title="Pending Payment Work Queue"
              headers={['Payment', 'Customer', 'Amount', 'Date']}
              rows={report.pendingPayments.map(payment => [
                `#${payment.payment_id}`,
                payment.username || payment.email || '-',
                formatMoney(payment.amount),
                payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-',
              ])}
              emptyText="No pending payments."
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

const ReportTable = ({ title, headers, rows, emptyText = 'No data.' }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100">
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase">
          <tr>
            {headers.map(header => <th key={header} className="px-5 py-3">{header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length > 0 ? rows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-3 text-gray-700 font-medium">{cell}</td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-gray-400">{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default SystemReport;
