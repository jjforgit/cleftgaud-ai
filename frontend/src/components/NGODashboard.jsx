import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FileCheck,
  AlertTriangle,
  DollarSign,
  Building2,
  TrendingUp,
  Activity,
  CheckCircle2,
  Upload,
  Calendar,
  Download,
} from 'lucide-react';
import MetricCard from './MetricCard';
import { weeklyVolumeData, triageDistributionData } from '../data/mockData';

export default function NGODashboard({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'review':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'upload':
        return <Upload className="w-4 h-4 text-brand-sky" />;
      default:
        return <Activity className="w-4 h-4 text-brand-blue" />;
    }
  };

  const handleDownloadImpactReport = () => {
    const report = `
SMILE TRAIN INDIA - CLEFTGUARD AI IMPACT AUDIT REPORT
Reporting Period: Q3 2026
============================================================
KEY PERFORMANCE INDICATORS:
- Total Scans Analyzed: 1,240 (+18% vs prev quarter)
- Urgent Cases Intercepted: 45 (98.4% diagnostic concordance)
- Estimated Travel Cost Saved: $24,800 (1,280 rural trips prevented)
- Active Rural Clinics Connected: 12 Centers in Karnataka & Maharashtra

CLINICAL TRIAGE BREAKDOWN:
- Normal Consolidated Bone Grafts: 85% (1,054 cases)
- Specialist Secondary Revision Required: 15% (186 cases)

PARTICIPATING HEALTHCARE CENTERS:
1. Dharwad Community Health Center (142 scans)
2. Hubli District Hospital (198 scans)
3. Belgaum Cleft Care Hub (165 scans)
4. Rampur Primary Health Unit (112 scans)
5. Bagalkot Rural Center (95 scans)

Audited by Smile Train Medical Advisory Council
============================================================
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmileTrain_Impact_Report_Q3_2026.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue tracking-tight">
            Program Impact Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Regional cleft care monitoring and outcomes.
          </p>
        </div>

        <button
          onClick={handleDownloadImpactReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-brand-sky text-brand-sky hover:bg-slate-50 text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download Monthly Impact Report
        </button>
      </div>

      {/* Top Row: 4 Metric Cards in a Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Scans Analyzed"
          value="1,240"
          trend="+18% this quarter"
          trendPositive={true}
          subtext="Across 12 clinics"
          icon={FileCheck}
        />
        <MetricCard
          label="Urgent Cases Intercepted"
          value="45"
          trend="98.4% precision"
          trendPositive={true}
          subtext="Early revision triage"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Est. Travel Cost Saved"
          value="$24,800"
          trend="~$20 per patient"
          trendPositive={true}
          subtext="1,280 trips avoided"
          icon={DollarSign}
        />
        <MetricCard
          label="Active Rural Clinics"
          value="12"
          trend="+3 new this month"
          trendPositive={true}
          subtext="Full coverage network"
          icon={Building2}
        />
      </div>

      {/* Middle Row: Two Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Weekly Screening Volume Line Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Screening Volume
              </h3>
              <p className="text-xs text-slate-400">
                Total rural scans vs urgent referrals escalated
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Last 7 Weeks
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="scans"
                  name="Rural Scans"
                  stroke="#00A3E0"
                  strokeWidth={2.5}
                  dot={{ fill: '#00A3E0', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  name="Urgent Referrals"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#EF4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Triage Distribution Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Triage Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Secondary alveolar bone graft healing ratio
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Cohort Analysis
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triageDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {triageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent System Activity Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent System Activity
            </h3>
            <p className="text-xs text-slate-400">
              Real-time chronological log of rural screenings and specialist reviews
            </p>
          </div>
          <span className="text-xs text-brand-sky font-semibold bg-sky-50 px-2 py-0.5 rounded">
            Live Stream
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {activities.map((item) => (
            <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {getActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 leading-snug">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {item.description}
                </div>
              </div>
              <div className="text-[11px] font-medium text-slate-400 shrink-0">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
