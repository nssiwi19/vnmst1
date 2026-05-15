import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { StatCards } from './DataHub/StatCards';
import { AdvancedFilters } from './DataHub/AdvancedFilters';
import { GrowthAnalysis } from './DataHub/GrowthAnalysis';
import { IndustryTopTen } from './DataHub/IndustryTopTen';
import { RegionalDistribution } from './DataHub/RegionalDistribution';
import { IntelligenceInsights } from './DataHub/IntelligenceInsights';
import { MonthlyHeatmap } from './DataHub/MonthlyHeatmap';
import { DataQualityAudit } from './DataHub/DataQualityAudit';
import { DataIngestion } from './DataHub/DataIngestion';
import { CompanyDirectory } from './DataHub/CompanyDirectory';
import { YoYGrowth } from './DataHub/YoYGrowth';
import { IndustryDonut } from './DataHub/IndustryDonut';

interface ChartData {
  name: string;
  value: number;
}

export function DataHub() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, sources: 1 });
  const [regionData, setRegionData] = useState<ChartData[]>([]);
  const [industryData, setIndustryData] = useState<ChartData[]>([]);
  const [dropdownIndustries, setDropdownIndustries] = useState<ChartData[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [qualityData, setQualityData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchCompanies();
  }, [page, searchTerm]);

  useEffect(() => {
    api.get(`/stats/by-industry`).then(res => setDropdownIndustries(res || []));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedIndustry, selectedYear]);

  const fetchCompanies = async () => {
    setLoadingTable(true);
    try {
      const data = await api.get(`/companies?q=${searchTerm}&page=${page}&page_size=10`);
      setCompanies(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoadingTable(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const yearParam = selectedYear ? `?year=${selectedYear}` : '';
      const industryParam = selectedIndustry ? `${selectedYear ? '&' : '?'}industry=${selectedIndustry}` : '';
      const commonParams = `${yearParam}${industryParam}`;

      const [regionRes, industryRes, summaryRes, growthRes, monthlyRes, qualityRes] = await Promise.all([
        api.get(`/stats/by-region${commonParams}`),
        api.get(`/stats/by-industry${commonParams}`),
        api.get(`/stats/summary${commonParams}`),
        api.get(`/stats/growth-trend${commonParams}`),
        api.get(`/stats/monthly-distribution${commonParams}`),
        api.get(`/stats/data-quality${commonParams}`)
      ]);

      setRegionData(regionRes || []);
      setIndustryData(industryRes || []);
      setSummary(summaryRes || {});
      setStats({ total: summaryRes.total || 0, sources: 2 });
      setGrowthData(growthRes || []);
      setMonthlyData(monthlyRes || []);
      setQualityData(qualityRes || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Bạn có muốn nạp 7 doanh nghiệp mẫu để chạy thử không?")) return;
    setSeeding(true);
    try {
      await api.post('/seed-demo', {});
      fetchStats();
      fetchCompanies();
      alert("Đã nạp dữ liệu mẫu thành công!");
    } catch (err) {
      alert("Lỗi khi nạp dữ liệu mẫu.");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (mst: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa doanh nghiệp MST ${mst}?`)) return;
    try {
      await api.delete(`/companies/${mst}`);
      fetchCompanies();
      fetchStats();
    } catch (err) {
      alert("Lỗi khi xóa.");
    }
  };

  const handleExport = () => {
    if (companies.length === 0) return;
    const headers = ["MST", "Tên Công ty", "SĐT", "Email", "Địa chỉ"];
    const rows = companies.map(c => [c.ma_so_thue, c.ten_cong_ty, c.so_dien_thoai, c.email, c.dia_chi_day_du]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_ba_doanh_nghiep.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/ingest-csv', formData);
      setStatus({ type: 'success', msg: `Nạp thành công dữ liệu từ ${file.name}` });
      setFile(null);
      fetchStats();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Lỗi khi nạp dữ liệu" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="data-hub-view animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: '#0a0a0c' }}>
      
      <AdvancedFilters 
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        industryData={dropdownIndustries}
        total={stats.total}
        loading={loadingStats}
      />

      <StatCards 
        stats={stats}
        summary={summary}
        regionCount={regionData.length}
        loading={loadingStats}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
        <GrowthAnalysis growthData={growthData} selectedYear={selectedYear} />
        <IndustryTopTen industryData={industryData} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
        <RegionalDistribution regionData={regionData} />
        <IntelligenceInsights summary={summary} growthData={growthData} />
      </div>

      <MonthlyHeatmap monthlyData={monthlyData} selectedYear={selectedYear} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
        <YoYGrowth growthData={growthData} />
        <IndustryDonut industryData={industryData} />
      </div>

      <DataQualityAudit qualityData={qualityData} total={stats.total} />

      <DataIngestion 
        file={file}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        uploading={uploading}
        status={status}
      />

      <CompanyDirectory 
        companies={companies}
        loadingTable={loadingTable}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        page={page}
        setPage={setPage}
        total={total}
        seeding={seeding}
        handleSeed={handleSeed}
        handleExport={handleExport}
        handleDelete={handleDelete}
      />
    </div>
  );
}
