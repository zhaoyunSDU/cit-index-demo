"use client";
import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
type PageKey = "dashboard" | "region" | "events" | "trend";
type Period = "7天" | "30天" | "90天";
type MetricKey = "综合指数" | "创新供给" | "成果转化" | "产业应用" | "创新生态";
type ChartSeries = {
    name: string;
    color: string;
    values: number[];
};
type Province = {
    rank: number;
    name: string;
    score: number;
    change: string;
    region: string;
    dimensions: number[];
};
type Coordinate = [
    number,
    number
];
type GeoGeometry = {
    type: "Polygon" | "MultiPolygon";
    coordinates: Coordinate[][] | Coordinate[][][];
};
type GeoFeature = {
    type: "Feature";
    properties: {
        name: string;
        center?: Coordinate;
        centroid?: Coordinate;
    };
    geometry: GeoGeometry;
};
type GeoFeatureCollection = {
    type: "FeatureCollection";
    features: GeoFeature[];
};
const primaryNav: Array<{
    key: PageKey;
    label: string;
    icon: string;
}> = [
    { key: "dashboard", label: "全国指数中心", icon: "⌂" },
    { key: "region", label: "区域地图", icon: "⌖" },
    { key: "events", label: "事件追踪", icon: "◉" },
    { key: "trend", label: "趋势分析", icon: "▥" },
];
const secondaryNav = [["▣", "数据看板"], ["♙", "指标体系"], ["▤", "数据来源"], ["▧", "报告中心"], ["♢", "预警中心"], ["⚙", "设置管理"]];
const metrics: Array<{
    key: Exclude<MetricKey, "综合指数">;
    value: number;
    change: string;
    color: string;
    icon: string;
}> = [
    { key: "创新供给", value: 108.6, change: "+1.18%", color: "#2878f0", icon: "供" },
    { key: "成果转化", value: 112.3, change: "+1.72%", color: "#12b9b5", icon: "转" },
    { key: "产业应用", value: 107.4, change: "+0.93%", color: "#7857e8", icon: "产" },
    { key: "创新生态", value: 109.1, change: "+1.07%", color: "#f29a2e", icon: "生" },
];
const baseTrend = [99.1, 100.3, 101.2, 101.0, 103.0, 104.4, 103.9, 105.7, 104.6, 105.2, 107.8, 105.6, 105.8, 108.2, 106.1, 108.6, 104.8, 106.5, 107.2, 108.9, 107.1, 109.5, 110.0, 107.4, 108.1, 107.6, 111.5, 108.3, 108.7, 109.8];
const drivers = [
    { name: "技术成果转化数量", value: "+0.42", width: 92, positive: true },
    { name: "专利授权数量", value: "+0.28", width: 78, positive: true },
    { name: "风险投资活跃度", value: "+0.23", width: 66, positive: true },
    { name: "高技术制造业增加值", value: "+0.18", width: 53, positive: true },
    { name: "企业研发投入强度", value: "+0.15", width: 45, positive: true },
    { name: "全球供应链不确定性", value: "−0.21", width: 64, positive: false },
    { name: "原材料价格指数", value: "−0.17", width: 50, positive: false },
    { name: "融资环境指数", value: "−0.08", width: 30, positive: false },
];
const provinces: Province[] = [
    { rank: 1, name: "广东", score: 118.7, change: "+1.36", region: "东部", dimensions: [118.2, 120.5, 123.1, 113.0] },
    { rank: 2, name: "北京", score: 117.3, change: "+0.89", region: "东部", dimensions: [125.2, 114.8, 109.5, 119.7] },
    { rank: 3, name: "江苏", score: 115.2, change: "+1.12", region: "东部", dimensions: [116.8, 117.6, 115.9, 110.5] },
    { rank: 4, name: "香港", score: 114.4, change: "+0.76", region: "东部", dimensions: [113.6, 117.1, 116.8, 110.2] },
    { rank: 5, name: "浙江", score: 113.8, change: "+0.93", region: "东部", dimensions: [112.9, 115.7, 114.6, 112.0] },
    { rank: 6, name: "上海", score: 112.9, change: "+1.21", region: "东部", dimensions: [119.3, 111.8, 106.7, 113.8] },
    { rank: 7, name: "山东", score: 112.6, change: "+1.28", region: "东部", dimensions: [111.5, 115.3, 113.2, 110.4] },
    { rank: 8, name: "天津", score: 110.8, change: "+0.54", region: "东部", dimensions: [113.1, 110.7, 108.4, 111.0] },
    { rank: 9, name: "湖北", score: 108.4, change: "−0.15", region: "中部", dimensions: [107.2, 110.6, 109.1, 106.7] },
    { rank: 10, name: "四川", score: 107.1, change: "+0.42", region: "西部", dimensions: [109.8, 105.9, 107.4, 105.3] },
    { rank: 11, name: "台湾", score: 106.5, change: "+0.47", region: "东部", dimensions: [108.8, 104.9, 109.2, 103.1] },
    { rank: 12, name: "安徽", score: 105.9, change: "+0.31", region: "中部", dimensions: [106.1, 107.4, 105.2, 104.9] },
    { rank: 13, name: "福建", score: 105.2, change: "+0.55", region: "东部", dimensions: [104.8, 106.4, 105.7, 103.9] },
    { rank: 14, name: "重庆", score: 104.8, change: "+0.38", region: "西部", dimensions: [105.6, 105.1, 104.3, 104.2] },
    { rank: 15, name: "河南", score: 104.5, change: "+0.27", region: "中部", dimensions: [104.1, 105.8, 106.0, 102.1] },
    { rank: 16, name: "陕西", score: 102.8, change: "+0.18", region: "西部", dimensions: [106.4, 101.8, 100.9, 102.1] },
    { rank: 17, name: "湖南", score: 102.4, change: "+0.36", region: "中部", dimensions: [103.8, 102.9, 103.1, 99.8] },
    { rank: 18, name: "澳门", score: 102.1, change: "+0.19", region: "东部", dimensions: [99.8, 103.4, 105.1, 100.1] },
    { rank: 19, name: "河北", score: 101.6, change: "+0.25", region: "东部", dimensions: [101.9, 102.7, 101.3, 100.5] },
    { rank: 20, name: "江西", score: 100.9, change: "+0.22", region: "中部", dimensions: [100.5, 102.1, 101.8, 99.2] },
    { rank: 21, name: "辽宁", score: 98.6, change: "−0.22", region: "东北", dimensions: [99.4, 97.8, 100.2, 96.9] },
    { rank: 22, name: "山西", score: 98.0, change: "+0.12", region: "中部", dimensions: [98.8, 97.6, 99.1, 96.5] },
    { rank: 23, name: "海南", score: 96.4, change: "+0.31", region: "东部", dimensions: [96.2, 97.5, 95.8, 96.1] },
    { rank: 24, name: "吉林", score: 94.9, change: "+0.08", region: "东北", dimensions: [96.3, 94.1, 95.0, 94.2] },
    { rank: 25, name: "广西", score: 94.5, change: "+0.24", region: "西部", dimensions: [94.1, 95.7, 96.2, 92.0] },
    { rank: 26, name: "贵州", score: 92.6, change: "+0.20", region: "西部", dimensions: [93.7, 92.2, 94.1, 90.4] },
    { rank: 27, name: "云南", score: 91.4, change: "+0.16", region: "西部", dimensions: [91.8, 92.6, 90.5, 90.7] },
    { rank: 28, name: "甘肃", score: 89.7, change: "+0.11", region: "西部", dimensions: [90.8, 88.9, 89.2, 89.9] },
    { rank: 29, name: "黑龙江", score: 88.2, change: "−0.18", region: "东北", dimensions: [89.4, 87.3, 88.8, 87.1] },
    { rank: 30, name: "内蒙古", score: 87.5, change: "+0.09", region: "西部", dimensions: [88.3, 86.8, 87.9, 87.0] },
    { rank: 31, name: "宁夏", score: 85.6, change: "+0.14", region: "西部", dimensions: [86.7, 85.9, 84.8, 85.0] },
    { rank: 32, name: "青海", score: 82.4, change: "+0.06", region: "西部", dimensions: [83.5, 81.7, 82.0, 82.4] },
    { rank: 33, name: "新疆", score: 80.8, change: "+0.04", region: "西部", dimensions: [82.1, 79.8, 80.4, 81.0] },
    { rank: 34, name: "西藏", score: 72.4, change: "+0.03", region: "西部", dimensions: [74.1, 70.9, 71.8, 72.8] },
];
const events = [
    { time: "10:28", name: "山东大学固态电池技术突破", region: "山东", type: "技术突破", status: "已评估", impact: "+1.18", level: "高影响事件", industry: "新能源 · 储能材料" },
    { time: "10:21", name: "中科院合肥物质院量子芯片进展", region: "安徽", type: "技术突破", status: "评估中", impact: "+0.36", level: "高影响事件", industry: "人工智能 · 先进计算" },
    { time: "10:15", name: "深圳某科技与比亚迪联合研发智能座舱", region: "广东", type: "企业合作", status: "已评估", impact: "+0.28", level: "中影响事件", industry: "高端制造 · 智能汽车" },
    { time: "10:08", name: "上海交通大学脑机接口临床试验获进展", region: "上海", type: "科研进展", status: "评估中", impact: "+0.21", level: "中影响事件", industry: "生物医药 · 医疗器械" },
    { time: "09:57", name: "江苏省先进材料产业创新中心揭牌成立", region: "江苏", type: "政策/平台", status: "已评估", impact: "+0.19", level: "中影响事件", industry: "新材料 · 公共平台" },
    { time: "09:46", name: "华为云与武汉大学共建人工智能联合实验室", region: "湖北", type: "企业合作", status: "已评估", impact: "+0.17", level: "中影响事件", industry: "人工智能 · 产学研" },
    { time: "09:33", name: "浙江大学新型光伏材料效率突破27%", region: "浙江", type: "技术突破", status: "已评估", impact: "+0.15", level: "中影响事件", industry: "新能源 · 光伏" },
    { time: "09:21", name: "成都高新区发布生物医药产业新政", region: "四川", type: "政策/平台", status: "评估中", impact: "+0.12", level: "一般事件", industry: "生物医药 · 政策支持" },
];
const industries = [
    { name: "人工智能", values: [120.5, 117.8, 112.3, 111.2] },
    { name: "新能源", values: [113.6, 115.9, 118.6, 110.4] },
    { name: "生物医药", values: [106.4, 108.7, 104.9, 103.2] },
    { name: "高端制造", values: [104.1, 106.8, 105.7, 103.8] },
    { name: "新材料", values: [98.7, 101.3, 99.4, 97.6] },
];
const trendInsights = [
    ["↗", "成果转化维度持续领跑", "近30天成果转化指数达112.3，环比上升2.91%。"],
    ["⌖", "山东近期周增长较快", "山东创新转化综合指数107.4，环比增长6.27%。"],
    ["▣", "人工智能领域表现亮眼", "产业应用指数达112.3，应用落地加速推进。"],
    ["¥", "投资活跃度稳步提升", "投资活跃度指数111.3，社会资本参与意愿增强。"],
    ["♟", "人才流动活跃度上升", "人才流动指数109.2，高端人才跨区域流动增加。"],
    ["▤", "政策支持力度保持稳定", "政策支持指数112.6，高频支持措施持续优化。"],
];
function MiniSpark({ color = "#2878f0", values = [3, 7, 6, 10, 8, 13, 10, 15, 12, 16] }: {
    color?: string;
    values?: number[];
}) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${26 - ((value - min) / Math.max(1, max - min)) * 22}`).join(" ");
    return <svg viewBox="0 0 100 28" className="mini-spark" aria-hidden="true"><polyline points={points} style={{ stroke: color }}/></svg>;
}
function LineChart({ series, height = 240, labels = ["04-23", "04-29", "05-05", "05-11", "05-17", "05-22"], area = false }: {
    series: ChartSeries[];
    height?: number;
    labels?: string[];
    area?: boolean;
}) {
    const width = 820;
    const pad = { left: 42, right: 48, top: 18, bottom: 30 };
    const values = series.flatMap((item) => item.values);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const min = Math.floor((rawMin - 4) / 5) * 5;
    const max = Math.ceil((rawMax + 4) / 5) * 5;
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const pointFor = (value: number, index: number, total: number) => ({ x: pad.left + (index / Math.max(1, total - 1)) * innerW, y: pad.top + ((max - value) / Math.max(1, max - min)) * innerH });
    return <div className="line-chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label={`${series.map((item) => item.name).join("、")}趋势图`}><defs><linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2878f0" stopOpacity=".22"/><stop offset="1" stopColor="#2878f0" stopOpacity="0"/></linearGradient></defs>{[0, 1, 2, 3, 4].map((index) => { const y = pad.top + (index / 4) * innerH; const value = Math.round(max - (index / 4) * (max - min)); return <g key={index}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="chart-grid-line"/><text x={pad.left - 10} y={y + 4} textAnchor="end" className="axis-text">{value}</text></g>; })}{area && series.length === 1 && (() => { const points = series[0].values.map((value, index) => pointFor(value, index, series[0].values.length)); return <polygon points={`${pad.left},${pad.top + innerH} ${points.map((point) => `${point.x},${point.y}`).join(" ")} ${width - pad.right},${pad.top + innerH}`} fill="url(#dashboardArea)"/>; })()}{series.map((item) => { const points = item.values.map((value, index) => pointFor(value, index, item.values.length)); const last = points[points.length - 1]; return <g key={item.name}><polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} style={{ stroke: item.color }} className="chart-series-line"/>{points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={index === points.length - 1 ? 3.5 : 2} style={{ fill: item.color }}/>)}<rect x={last.x + 5} y={last.y - 10} width="39" height="20" rx="4" style={{ fill: item.color }}/><text x={last.x + 24.5} y={last.y + 4} textAnchor="middle" className="last-value">{item.values.at(-1)?.toFixed(1)}</text></g>; })}{labels.map((label, index) => <text key={label} x={pad.left + (index / (labels.length - 1)) * innerW} y={height - 7} textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"} className="axis-text">{label}</text>)}</svg></div>;
}
function Radar({ values, labels = ["创新供给", "成果转化", "产业应用", "创新生态"] }: {
    values: number[];
    labels?: string[];
}) {
    const cx = 130, cy = 92, radius = 58;
    const angleFor = (index: number) => -Math.PI / 2 + (index * Math.PI * 2) / values.length;
    const point = (index: number, scale: number) => `${cx + Math.cos(angleFor(index)) * radius * scale},${cy + Math.sin(angleFor(index)) * radius * scale}`;
    const dataPoints = values.map((value, index) => point(index, Math.max(.18, Math.min(1, (value - 80) / 45)))).join(" ");
    return <svg viewBox="0 0 260 190" className="radar-chart" role="img" aria-label="四维指数雷达图">{[.25, .5, .75, 1].map((scale) => <polygon key={scale} points={values.map((_, index) => point(index, scale)).join(" ")} className="radar-grid"/>)}{values.map((_, index) => <line key={index} x1={cx} y1={cy} x2={point(index, 1).split(",")[0]} y2={point(index, 1).split(",")[1]} className="radar-axis"/>)}<polygon points={dataPoints} className="radar-data"/>{values.map((value, index) => { const [x, y] = point(index, 1.27).split(",").map(Number); return <g key={labels[index]}><text x={x} y={y - 3} textAnchor="middle" className="radar-label">{labels[index]}</text><text x={x} y={y + 11} textAnchor="middle" className="radar-value">{value.toFixed(1)}</text></g>; })}</svg>;
}
function Donut({ center, items }: {
    center: string;
    items: Array<{
        label: string;
        value: number;
        color: string;
    }>;
}) {
    let cursor = 0;
    const segments = items.map((item) => { const start = cursor; cursor += item.value; return `${item.color} ${start}% ${cursor}%`; }).join(", ");
    return <div className="donut-layout"><div className="donut" style={{ background: `conic-gradient(${segments})` }}><span>{center}</span></div><div className="donut-legend">{items.map((item) => <div key={item.label}><i style={{ background: item.color }}/><span>{item.label}</span><strong>{item.value}%</strong></div>)}</div></div>;
}
function Panel({ title, action, children, className = "" }: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return <section className={`panel ${className}`}><header className="panel-head"><h2>{title}<span className="info-dot">i</span></h2>{action}</header><div className="panel-body">{children}</div></section>;
}
function Header({ active, onChange, updateTime, onRefresh }: {
    active: PageKey;
    onChange: (page: PageKey) => void;
    updateTime: string;
    onRefresh: () => void;
}) {
    return <header className="app-header"><button className="brand-block" type="button" onClick={() => onChange("dashboard")} aria-label="返回全国指数中心"><span className="brand-emblem">✦</span><span><strong>中国创新转化指数 <b>CIT Index</b></strong><small>实时监测与分析平台</small></span></button><nav className="top-nav" aria-label="主栏目">{primaryNav.map((item) => <button key={item.key} type="button" className={active === item.key ? "active" : ""} onClick={() => onChange(item.key)}>{item.label}</button>)}</nav><div className="header-tools"><button className="notification" type="button" aria-label="通知">♢<i>12</i></button><button type="button" aria-label="帮助">?</button><span>您好，管理员⌄</span></div><div className="update-strip"><span>▣</span>{updateTime} 更新 <button type="button" onClick={onRefresh} aria-label="刷新数据">↻</button></div></header>;
}
function Sidebar({ active, onChange, onSecondary }: {
    active: PageKey;
    onChange: (page: PageKey) => void;
    onSecondary: (label: string) => void;
}) {
    return <aside className="sidebar"><nav className="side-nav" aria-label="侧边导航">{primaryNav.map((item) => <button key={item.key} type="button" className={active === item.key ? "active" : ""} onClick={() => onChange(item.key)}><span>{item.icon}</span>{item.label}{active === item.key && <i>›</i>}</button>)}<div className="nav-separator"/>{secondaryNav.map(([icon, label]) => <button key={label} type="button" onClick={() => onSecondary(label)}><span>{icon}</span>{label}</button>)}</nav><div className="data-note"><strong>数据说明 <span>i</span></strong><p>平台数据来源于公开统计及合作机构，当前演示结果仅供参考。</p><em>DEMO DATA</em></div></aside>;
}
function Dashboard({ period, setPeriod, metric, setMetric, setPage }: {
    period: Period;
    setPeriod: (p: Period) => void;
    metric: MetricKey;
    setMetric: (m: MetricKey) => void;
    setPage: (p: PageKey) => void;
}) {
    const metricInfo = metrics.find((item) => item.key === metric);
    const metricValue = metricInfo?.value ?? 109.8;
    const offset = metricValue - 109.8;
    const count = period === "7天" ? 7 : 30;
    const trend = baseTrend.slice(-count).map((value, index) => value + offset + (period === "90天" ? Math.sin(index / 3) * 1.4 : 0));
    const color = metricInfo?.color ?? "#2878f0";
    const historyRows = [{ name: "全国创新转化指数", value: 109.8, d: "+1.25%", w: "+3.42%", m: "+6.18%", y: "+9.80%" }, ...metrics.map((item) => ({ name: item.key, value: item.value, d: item.change, w: item.key === "成果转化" ? "+4.35%" : "+2.91%", m: item.key === "创新供给" ? "+5.32%" : "+7.91%", y: item.key === "成果转化" ? "+11.23%" : "+8.47%" }))];
    return <div className="dashboard-page page-grid"><section className="score-hero"><div><span>全国创新转化指数 <i className="info-dot">i</i></span><strong>{metricValue.toFixed(1)}</strong><b>{metricInfo?.change ?? "+1.25%"} ↑</b><small>较昨日　+1.35</small></div><div className="score-orbit"><i /><i /><i /><span>CIT</span></div><footer>◷ 2026-08-19 16:30:00 更新</footer></section><Panel title={`全国${metric}实时曲线`} className="dashboard-main-chart" action={<div className="segmented">{(["7天", "30天", "90天"] as Period[]).map((item) => <button key={item} type="button" className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>}><div className="chart-legend"><i style={{ background: color }}/>{metric}</div><LineChart series={[{ name: metric, color, values: trend }]} height={225} area/><p className="chart-footnote">注：基期指数为2020年=100</p></Panel><Panel title="今日关键影响因素" className="drivers-panel"><div className="driver-table-head"><span>因素</span><span>对指数影响</span><span>影响值</span></div><div className="driver-list">{drivers.map((item) => <div key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.width}%`, background: item.positive ? "#16ad65" : "#f24e5a" }}/></i><strong className={item.positive ? "positive" : "negative"}>{item.positive ? "↑" : "↓"} {item.value}</strong></div>)}</div><button className="panel-link" type="button" onClick={() => setPage("trend")}>查看全部影响因素 ›</button></Panel><div className="metric-strip">{metrics.map((item) => <button className={metric === item.key ? "metric-tile selected" : "metric-tile"} key={item.key} type="button" onClick={() => setMetric(item.key)} style={{ "--metric-color": item.color } as CSSProperties}><span className="metric-round">{item.icon}</span><span><small>{item.key} <i className="info-dot">i</i></small><strong>{item.value}</strong></span><b>{item.change} ↑</b><MiniSpark color={item.color}/></button>)}</div><Panel title="最新创新事件" action={<button className="plain-action" type="button" onClick={() => setPage("events")}>更多 ›</button>} className="latest-events"><div className="simple-table event-brief"><div className="table-head"><span>时间</span><span>事件</span><span>地区</span><span>影响指数</span></div>{events.slice(0, 5).map((item) => <button type="button" key={item.time} onClick={() => setPage("events")}><span>{item.time}</span><span>{item.name}</span><span>{item.region}</span><strong>{item.impact}</strong></button>)}</div><button className="panel-link" type="button" onClick={() => setPage("events")}>查看全部事件 ›</button></Panel><Panel title="行业贡献度（近30天）" className="industry-donut"><Donut center="贡献度\n(%)" items={[{ label: "人工智能", value: 28.6, color: "#2878f0" }, { label: "新能源", value: 22.4, color: "#14b8b5" }, { label: "生物医药", value: 18.7, color: "#ffae24" }, { label: "高端制造", value: 15.6, color: "#765be8" }, { label: "新材料", value: 8.9, color: "#65a7ed" }, { label: "其他", value: 5.8, color: "#c7d7eb" }]}/><button className="panel-link" type="button" onClick={() => setPage("trend")}>查看行业详情 ›</button></Panel><Panel title="指数历史区间" action={<button className="plain-action" type="button" onClick={() => setPage("trend")}>更多指标 ›</button>} className="history-panel"><div className="history-table"><div className="table-head"><span>指数</span><span>最新值</span><span>日涨跌</span><span>周涨跌</span><span>月涨跌</span><span>年初至今</span></div>{historyRows.map((row) => <div key={row.name}><strong>{row.name}</strong><span>{row.value}</span><b>{row.d}</b><b>{row.w}</b><b>{row.m}</b><b>{row.y}</b></div>)}</div><p className="chart-footnote">注：基期指数为2020年=100</p></Panel></div>;
}
const mapLegend = [
    ["#176fe8", "120及以上"],
    ["#3d8ff0", "110–120"],
    ["#65b6dd", "100–110"],
    ["#79cbb1", "90–100"],
    ["#f3d58b", "80–90"],
    ["#dfe5ec", "80以下"],
] as const;

const mapLabelOffsets: Record<string, Coordinate> = {
    北京: [-7, -8],
    天津: [10, 8],
    上海: [10, 3],
    江苏: [8, -5],
    浙江: [10, 5],
    香港: [12, 8],
    澳门: [-12, 7],
    海南: [0, 9],
};

function normalizeProvinceName(name: string) {
    return name
        .replace(/特别行政区$/, "")
        .replace(/(?:壮族|回族|维吾尔)自治区$/, "")
        .replace(/自治区$/, "")
        .replace(/[省市]$/, "");
}

function getGeometryRings(feature: GeoFeature): Coordinate[][] {
    if (feature.geometry.type === "Polygon") return feature.geometry.coordinates as Coordinate[][];
    return (feature.geometry.coordinates as Coordinate[][][]).flat();
}

function ringAverageLatitude(ring: Coordinate[]) {
    return ring.reduce((total, point) => total + point[1], 0) / Math.max(1, ring.length);
}

function projectMainMap([longitude, latitude]: Coordinate): Coordinate {
    return [164 + ((longitude - 73.2) / 62) * 560, 25 + ((53.8 - latitude) / 35.8) * 405];
}

function projectSouthSeaInset([longitude, latitude]: Coordinate): Coordinate {
    return [658 + ((longitude - 108) / 11.3) * 62, 350 + ((17.5 - latitude) / 14.3) * 90];
}

function buildGeoPath(feature: GeoFeature, project: (coordinate: Coordinate) => Coordinate, includeRing: (ring: Coordinate[]) => boolean) {
    return getGeometryRings(feature)
        .filter((ring) => ring.length > 2 && includeRing(ring))
        .map((ring) => ring.map((coordinate, index) => {
            const [x, y] = project(coordinate);
            return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(" ") + " Z")
        .join(" ");
}

function provinceMetricValue(province: Province, metric: MetricKey) {
    if (metric === "综合指数") return province.score;
    const dimensionIndex = (["创新供给", "成果转化", "产业应用", "创新生态"] as MetricKey[]).indexOf(metric);
    return province.dimensions[dimensionIndex];
}

function provinceHeatColor(value: number) {
    if (value >= 120) return "#176fe8";
    if (value >= 110) return "#3d8ff0";
    if (value >= 100) return "#65b6dd";
    if (value >= 90) return "#79cbb1";
    if (value >= 80) return "#f3d58b";
    return "#dfe5ec";
}

function ChinaProvinceMap({ selected, setSelected, metric }: {
    selected: Province;
    setSelected: (province: Province) => void;
    metric: MetricKey;
}) {
    const [mapData, setMapData] = useState<GeoFeatureCollection | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [hoveredName, setHoveredName] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/data/china-provinces.geojson", { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error("地图数据加载失败");
                return response.json() as Promise<GeoFeatureCollection>;
            })
            .then(setMapData)
            .catch((error: Error) => {
                if (error.name !== "AbortError") setLoadError(true);
            });
        return () => controller.abort();
    }, []);

    const shapes = useMemo(() => {
        if (!mapData) return [];
        return mapData.features.flatMap((feature) => {
            const name = normalizeProvinceName(feature.properties.name);
            const province = provinces.find((item) => item.name === name);
            if (!province) return [];
            const path = buildGeoPath(feature, projectMainMap, (ring) => ringAverageLatitude(ring) >= 17.8);
            if (!path) return [];
            const center = feature.properties.centroid ?? feature.properties.center;
            if (!center) return [];
            const [baseX, baseY] = projectMainMap(center);
            const [offsetX, offsetY] = mapLabelOffsets[name] ?? [0, 0];
            return [{ province, path, labelX: baseX + offsetX, labelY: baseY + offsetY }];
        });
    }, [mapData]);

    const southSeaInset = useMemo(() => {
        if (!mapData) return { border: "", islands: "" };
        const boundaryFeature = mapData.features.find((feature) => !feature.properties.name);
        const hainanFeature = mapData.features.find((feature) => normalizeProvinceName(feature.properties.name) === "海南");
        return {
            border: boundaryFeature ? buildGeoPath(boundaryFeature, projectSouthSeaInset, () => true) : "",
            islands: hainanFeature ? buildGeoPath(hainanFeature, projectSouthSeaInset, (ring) => ringAverageLatitude(ring) < 17.8) : "",
        };
    }, [mapData]);

    const displayedProvince = provinces.find((province) => province.name === hoveredName) ?? selected;
    const displayedValue = provinceMetricValue(displayedProvince, metric);
    const hainan = provinces.find((province) => province.name === "海南")!;
    const handleMapKey = (event: KeyboardEvent<SVGGElement>, province: Province) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelected(province);
        }
    };

    return <div className="map-stage">
        <div className="map-legend">
            <strong>指数等级（得分）</strong>
            {mapLegend.map(([color, label]) => <span key={label}><i style={{ background: color }} />{label}</span>)}
            <em>34 个省级区域均可选择</em>
        </div>
        {!mapData && !loadError && <div className="map-loading"><i />省级边界地图加载中…</div>}
        {loadError && <div className="map-loading error">地图数据暂未加载，请刷新重试</div>}
        {mapData && <svg viewBox="0 0 760 480" className="china-map-svg" role="group" aria-label="中国省级创新转化指数交互地图">
            <defs>
                <filter id="provinceShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#24578f" floodOpacity=".18" />
                </filter>
            </defs>
            <g className="province-layer" filter="url(#provinceShadow)">
                {shapes.map(({ province, path, labelX, labelY }) => {
                    const value = provinceMetricValue(province, metric);
                    const isSelected = selected.name === province.name;
                    const isHovered = hoveredName === province.name;
                    return <g
                        key={province.name}
                        className={`province-group${isSelected ? " selected" : ""}${isHovered ? " hovered" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`${province.name}${metric}${value.toFixed(1)}，点击查看详情`}
                        onClick={() => setSelected(province)}
                        onKeyDown={(event) => handleMapKey(event, province)}
                        onMouseEnter={() => setHoveredName(province.name)}
                        onMouseLeave={() => setHoveredName(null)}
                        onFocus={() => setHoveredName(province.name)}
                        onBlur={() => setHoveredName(null)}
                    >
                        <path d={path} className="province-shape" fill={provinceHeatColor(value)} fillRule="evenodd"><title>{province.name}：{value.toFixed(1)}</title></path>
                        <text x={labelX} y={labelY} className="province-label" textAnchor="middle" dominantBaseline="middle">{province.name}</text>
                    </g>;
                })}
            </g>
            <g className="south-sea-inset" aria-label="南海诸岛示意">
                <rect x="651" y="342" width="78" height="108" rx="2" />
                <path d={southSeaInset.border} className="south-sea-border" fillRule="evenodd" />
                <path
                    d={southSeaInset.islands}
                    className={`south-sea-islands${selected.name === "海南" ? " selected" : ""}`}
                    fill={provinceHeatColor(provinceMetricValue(hainan, metric))}
                    fillRule="evenodd"
                    onClick={() => setSelected(hainan)}
                />
                <text x="690" y="463" textAnchor="middle">南海诸岛</text>
            </g>
        </svg>}
        <div className="map-tooltip" aria-live="polite">
            <span>{displayedProvince.name}<em>{displayedProvince.region}</em></span>
            <small>{metric}</small>
            <strong>{displayedValue.toFixed(1)}</strong>
            <b className={displayedProvince.change.startsWith("−") ? "negative" : "positive"}>{displayedProvince.change} {displayedProvince.change.startsWith("−") ? "↓" : "↑"}</b>
            <i>点击区域查看完整画像</i>
        </div>
        <p className="map-note">注：点击或使用键盘选择任一省级区域；边界仅供演示，不作测绘依据。基期指数为2020年=100</p>
    </div>;
}

function RegionPage({ selected, setSelected }: {
    selected: Province;
    setSelected: (province: Province) => void;
}) {
    const [mapMetric, setMapMetric] = useState<MetricKey>("综合指数");
    const regionCards = [
        { name: "东部地区", region: "东部", score: 113.8, change: "+1.15", color: "#2878f0", best: "广东 118.7", low: "海南 96.4" },
        { name: "中部地区", region: "中部", score: 103.4, change: "+0.72", color: "#12b9b5", best: "湖北 108.4", low: "山西 98.0" },
        { name: "西部地区", region: "西部", score: 93.8, change: "+0.38", color: "#7857e8", best: "四川 107.1", low: "西藏 72.4" },
        { name: "东北地区", region: "东北", score: 93.7, change: "−0.21", color: "#f29a2e", best: "辽宁 98.6", low: "黑龙江 88.2" },
    ];
    const regionCounts = regionCards.map((card) => provinces.filter((province) => province.region === card.region).length);

    return <div className="region-page page-grid">
        <Panel
            title="全国及省级创新转化指数地图"
            className="map-panel"
            action={<select value={mapMetric} aria-label="选择地图指标" onChange={(event) => setMapMetric(event.target.value as MetricKey)}>{(["综合指数", "创新供给", "成果转化", "产业应用", "创新生态"] as MetricKey[]).map((item) => <option key={item}>{item}</option>)}</select>}
        >
            <ChinaProvinceMap selected={selected} setSelected={setSelected} metric={mapMetric} />
        </Panel>
        <Panel title="省级指数排名" className="province-ranking" action={<button className="plain-action" type="button">更多 ›</button>}>
            <div className="rank-table">
                <div className="table-head"><span>排名</span><span>省份</span><span>综合指数</span><span>较昨日</span></div>
                {provinces.slice(0, 10).map((province) => <button key={province.name} className={selected.name === province.name ? "active" : ""} type="button" onClick={() => setSelected(province)}><i className={`medal medal-${province.rank}`}>{province.rank}</i><strong>{province.name}</strong><span>{province.score}</span><b className={province.change.startsWith("−") ? "negative" : "positive"}>{province.change} {province.change.startsWith("−") ? "↓" : "↑"}</b></button>)}
            </div>
            <button className="panel-link" type="button">查看完整排名 ›</button>
        </Panel>
        <Panel title={`${selected.name}创新转化指数`} className="province-profile" action={<select aria-label="选择省级区域" value={selected.name} onChange={(event) => setSelected(provinces.find((item) => item.name === event.target.value) ?? selected)}>{provinces.map((province) => <option key={province.name}>{province.name}</option>)}</select>}>
            <div className="province-score"><span>综合指数</span><strong>{selected.score}</strong><b className={selected.change.startsWith("−") ? "negative" : "positive"}>{selected.change} {selected.change.startsWith("−") ? "↓" : "↑"}</b><small>创新供给　{selected.dimensions[0]}</small></div>
            <Radar values={selected.dimensions} />
            <div className="dimension-bars">{["创新供给", "成果转化", "产业应用", "创新生态"].map((name, index) => <div key={name}><span>{name}</span><i><b style={{ width: `${Math.max(3, Math.min(100, (selected.dimensions[index] - 70) * 2))}%` }} /></i><strong>{selected.dimensions[index]}</strong><em>+{(1.05 + index * .19).toFixed(2)} ↑</em></div>)}</div>
        </Panel>
        <Panel title="区域发展对比" className="region-compare">
            <div className="region-card-grid">{regionCards.map((item, index) => <article key={item.name} style={{ "--region-color": item.color } as CSSProperties}><div><i>⌘</i><span>{item.name}</span></div><strong>{item.score}</strong><b>{item.change} ↑</b><MiniSpark color={item.color} /><footer><span>省级区域　{regionCounts[index]}</span><span>最高*　{item.best}</span><span>最低　{item.low}</span></footer></article>)}</div>
        </Panel>
        <Panel title="区域分布统计" className="region-distribution">
            <Donut center="34\n省份" items={[{ label: "东部地区", value: 38.2, color: "#2878f0" }, { label: "中部地区", value: 17.6, color: "#12b9b5" }, { label: "西部地区", value: 35.3, color: "#7857e8" }, { label: "东北地区", value: 8.9, color: "#ffae24" }]} />
        </Panel>
        <Panel title={`${selected.name}综合指数近30天趋势`} className="province-trend" action={<select aria-label="选择趋势周期"><option>近30天</option><option>近90天</option></select>}>
            <LineChart series={[{ name: `${selected.name}综合指数`, color: "#2878f0", values: baseTrend.map((value) => value + selected.score - 109.8) }]} height={190} area />
            <p className="chart-footnote">注：基期指数为2020年=100</p>
        </Panel>
    </div>;
}

function EventsPage({ selected, setSelected }: {
    selected: (typeof events)[number];
    setSelected: (event: (typeof events)[number]) => void;
}) {
    const [filter, setFilter] = useState("全部");
    const filtered = filter === "高影响" ? events.filter((item) => item.level === "高影响事件") : events;
    const stats = [{ icon: "▧", color: "#2878f0", label: "今日追踪事件总数", value: "286", change: "+18.5% ↑" }, { icon: "ϟ", color: "#7857e8", label: "高影响事件（今日）", value: "26", change: "+30.0% ↑" }, { icon: "◷", color: "#12b9b5", label: "平均响应时间", value: "18 分钟", change: "−4 分钟 ↓" }];
    const flow = [["◎", "事件识别", "系统监测到相关公开信息"], ["▦", "领域判断", selected.industry.split(" · ")[0]], ["⌖", "区域识别", `${selected.region}省`], ["▥", "影响评估", "综合评估事件影响强度"], ["↗", "指数更新", "纳入指数模型更新计算"]];
    return <div className="events-page page-grid"><div className="event-stats">{stats.map((item) => <article key={item.label} style={{ "--stat-color": item.color } as CSSProperties}><i>{item.icon}</i><div><span>{item.label}</span><strong>{item.value}</strong><b>较昨日　{item.change}</b></div><MiniSpark color={item.color}/></article>)}</div><Panel title="实时事件流" className="event-stream" action={<div className="tab-actions">{["全部", "高影响", "我关注的"].map((item) => <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>}><div className="event-table"><div className="table-head"><span>时间</span><span>事件名称</span><span>地区</span><span>类型</span><span>状态</span></div>{filtered.map((item) => <button type="button" key={item.time} onClick={() => setSelected(item)} className={selected.time === item.time ? "selected" : ""}><span><i />{item.time}</span><strong>{item.name}</strong><span>{item.region}</span><span>{item.type}</span><b className={item.status === "已评估" ? "tag-green" : "tag-orange"}>{item.status}</b></button>)}</div><button className="panel-link" type="button">查看全部事件 ›</button></Panel><Panel title="创新事件 → 指数变化链路" className="event-linkage"><article className="current-event"><span>当前示例事件</span><strong>{selected.name}</strong><small>2026-08-19 {selected.time}　来源：高校官网</small></article><div className="flow-chain">{flow.map((item, index) => <div className="flow-step-wrap" key={item[1]}><article><i>{item[0]}</i><strong>{item[1]}</strong><span>{item[2]}</span></article>{index < flow.length - 1 && <b>···›</b>}</div>)}</div><p className="linkage-status">●　该事件影响已纳入最新指数计算（更新于 16:30）</p></Panel><Panel title="事件影响分析" className="event-impact"><h3>{selected.name}</h3><dl><div><dt>地区</dt><dd>{selected.region}省</dd></div><div><dt>所属行业</dt><dd>{selected.industry}</dd></div><div><dt>事件类型</dt><dd>{selected.type}</dd></div><div><dt>影响等级</dt><dd><b>{selected.level}</b> ★★★★★</dd></div></dl><div className="impact-tags">{metrics.map((item) => <span key={item.key}>{item.key}</span>)}</div><h4>指数影响（短期）</h4><div className="impact-boxes"><article><span>全国指数</span><strong>+0.32</strong><small>+0.29% ↑</small></article><article><span>{selected.region}指数</span><strong>{selected.impact}</strong><small>+1.42% ↑</small></article></div><p>预计持续影响：7–30天</p><button className="panel-link" type="button">查看详细评估报告 ›</button></Panel><Panel title="影响路径可视化（事件传导链）" className="event-path"><div className="path-chain">{[["⚗", "科研突破", selected.name, "08-19"], ["▧", "技术转移", "专利布局完善，技术成果对外发布", "08-20～09-05"], ["♟", "企业合作", "与头部电池企业建立联合研发机制", "09-05～10-05"], ["▥", "产业化", "中试验证推进，量产应用场景落地", "10-05～11-15"], ["↗", "指数上升", "综合影响显现，带动指数提升", "持续影响中"]].map((item, index) => <div className="path-wrap" key={item[1]}><article><i>{item[0]}</i><strong>{item[1]}</strong><span>{item[2]}</span><small>{item[3]}</small></article>{index < 4 && <b>⟶</b>}</div>)}</div><footer>影响强度：　<span>● 直接影响</span><span>● 较强影响</span><span>● 中等影响</span><span>● 间接影响</span><span>● 长期影响</span></footer></Panel></div>;
}
function TrendPage({ period, setPeriod }: {
    period: Period;
    setPeriod: (p: Period) => void;
}) {
    const [region, setRegion] = useState("全国");
    const [industry, setIndustry] = useState("全部行业");
    const regionScore = provinces.find((item) => item.name === region)?.score ?? 109.8;
    const regionOffset = regionScore - 109.8;
    const trendSeries: ChartSeries[] = [{ name: "创新供给", color: "#2878f0", values: baseTrend.map((v) => v - 1.2 + regionOffset * .08) }, { name: "成果转化", color: "#12a9b1", values: baseTrend.map((v, i) => v + 2.5 + Math.sin(i / 3) * 1.5 + regionOffset * .08) }, { name: "产业应用", color: "#765be8", values: baseTrend.map((v, i) => v - 2.4 + Math.cos(i / 4) * 1.3 + regionOffset * .08) }, { name: "创新生态", color: "#f29a2e", values: baseTrend.map((v, i) => v - .7 + Math.sin(i / 5) + regionOffset * .08) }].map((item) => ({ ...item, values: period === "7天" ? item.values.slice(-7) : item.values }));
    return <div className="trend-page page-grid"><div className="filter-bar"><label>时间范围<select value={period} onChange={(e) => setPeriod(e.target.value as Period)}><option>7天</option><option>30天</option><option>90天</option></select></label><label>区域<select value={region} onChange={(e) => setRegion(e.target.value)}><option>全国</option>{provinces.slice(0, 10).map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>行业领域<select value={industry} onChange={(e) => setIndustry(e.target.value)}><option>全部行业</option>{industries.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>指标维度<select><option>全部维度</option>{metrics.map((item) => <option key={item.key}>{item.key}</option>)}</select></label></div><Panel title="创新转化趋势分析" className="multi-trend" action={<div className="segmented">{(["7天", "30天", "90天"] as Period[]).map((item) => <button type="button" key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}<button type="button">自定义</button><button type="button" aria-label="下载数据">↓</button></div>}><div className="multi-legend">{trendSeries.map((item) => <span key={item.name}><i style={{ background: item.color }}/>{item.name}</span>)}</div><LineChart series={trendSeries} height={250}/><p className="chart-footnote">注：基期指数为2020年=100　 当前筛选：{region} · {industry}</p></Panel><Panel title="产业领域趋势" className="industry-bars" action={<select value={industry} onChange={(e) => setIndustry(e.target.value)}><option>全部行业</option>{industries.map((item) => <option key={item.name}>{item.name}</option>)}</select>}><div className="bar-legend">{metrics.map((item) => <span key={item.key}><i style={{ background: item.color }}/>{item.key}</span>)}</div><div className="grouped-bars">{industries.map((item) => <div className={industry === item.name ? "highlight" : ""} key={item.name}><div className="bars">{item.values.map((value, index) => <i key={index} style={{ height: `${(value - 80) * 2.3}px`, background: metrics[index].color }}><span>{value}</span></i>)}</div><strong>{item.name}</strong></div>)}</div><p className="chart-footnote">注：基期指数为2020年=100</p></Panel><Panel title="区域发展对比" className="region-bars"><div className="bar-legend"><span><i style={{ background: "#2878f0" }}/>创新转化综合指数</span><span><i style={{ background: "#12a9b1" }}/>环比增长率（%）</span></div><div className="regional-bar-chart">{provinces.slice(0, 10).map((item, index) => <div key={item.name}><span className="bar-value">{item.score}</span><i style={{ height: `${(item.score - 80) * 3.1}px` }}/><b style={{ bottom: `${30 + (index % 3) * 8}px` }}>{index % 2 === 0 ? "−" : ""}{(index * .34 + .72).toFixed(2)}%</b><strong>{item.name}</strong></div>)}</div><p className="chart-footnote">注：基期指数为2020年=100</p></Panel><Panel title="创新生态变快" className="ecosystem-radar" action={<select><option>近30天</option><option>前30天</option></select>}><Radar values={[112.6, 111.3, 109.2, 110.1]} labels={["政策支持", "投资活跃度", "人才流动", "市场需求"]}/><div className="radar-key"><span><i />近30天</span><span><i />前30天</span></div><p className="chart-footnote">注：基期指数为2020年=100</p></Panel><Panel title="趋势洞察" className="trend-insights"><div className="insight-grid">{trendInsights.map((item, index) => <article key={item[1]}><i className={`insight-${index}`}>{item[0]}</i><div><strong>{item[1]}</strong><p>{item[2]}</p></div></article>)}</div></Panel></div>;
}
export default function Home() {
    const [activePage, setActivePage] = useState<PageKey>("dashboard");
    const [period, setPeriod] = useState<Period>("30天");
    const [metric, setMetric] = useState<MetricKey>("综合指数");
    const [selectedProvince, setSelectedProvince] = useState(provinces.find((province) => province.name === "山东") ?? provinces[0]);
    const [selectedEvent, setSelectedEvent] = useState(events[0]);
    const [updateTime, setUpdateTime] = useState("2026-08-19 16:30:00");
    const [toast, setToast] = useState("");
    const pageTitle = useMemo(() => primaryNav.find((item) => item.key === activePage)?.label ?? "全国指数中心", [activePage]);
    const handleSecondary = (label: string) => { setToast(`${label}将在正式数据版本中开放`); window.setTimeout(() => setToast(""), 2400); };
    const refresh = () => { setUpdateTime(new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()).replaceAll("/", "-")); setToast("演示数据已刷新"); window.setTimeout(() => setToast(""), 1800); };
    return <div className="desktop-app"><Header active={activePage} onChange={setActivePage} updateTime={updateTime} onRefresh={refresh}/><Sidebar active={activePage} onChange={setActivePage} onSecondary={handleSecondary}/><main className="app-main" aria-label={pageTitle}>{activePage === "dashboard" && <Dashboard period={period} setPeriod={setPeriod} metric={metric} setMetric={setMetric} setPage={setActivePage}/>}{activePage === "region" && <RegionPage selected={selectedProvince} setSelected={setSelectedProvince}/>}{activePage === "events" && <EventsPage selected={selectedEvent} setSelected={setSelectedEvent}/>}{activePage === "trend" && <TrendPage period={period} setPeriod={setPeriod}/>}</main><div className="demo-watermark">DEMO · 虚拟演示数据</div>{toast && <div className="toast" role="status">✓ {toast}</div>}</div>;
}
