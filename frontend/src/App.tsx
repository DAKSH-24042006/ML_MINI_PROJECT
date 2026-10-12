import React, { useState, useEffect } from 'react';
import { Sidebar, ViewTab } from './components/Sidebar';
import { CircuitMap } from './components/CircuitMap';
import { StackedTelemetryCanvas } from './components/StackedTelemetryCanvas';
import { LapAnalysisView } from './components/LapAnalysisView';
import { SimulatorView } from './components/SimulatorView';
import { CornerSimulator } from './components/CornerSimulator';
import { DriverComparisonView } from './components/DriverComparisonView';
import { CornerDeltaView } from './components/CornerDeltaView';
import { FeatureAnalysisView } from './components/FeatureAnalysisView';
import { ModelResultsView } from './components/ModelResultsView';
import { MetricsOverview } from './components/MetricsOverview';
import { DriverComparison } from './components/DriverComparison';
import { SketchfabViewer } from './components/SketchfabViewer';
import {
  fetchAvailableSessions,
  loadSessionData,
  runRegression,
  runClassification,
  runClustering,
  fetchFeatureImportance,
  fetchTelemetryComparison,
} from './services/api';
import {
  SessionInfo,
  PreprocessingStats,
  DriverSummary,
  RegressionResponse,
  ClassificationResponse,
  ClusteringResponse,
  FeatureImportanceItem,
  TelemetryCompareResponse,
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('corner-simulator');

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(2023);
  const [selectedGP, setSelectedGP] = useState<string>('Monza');
  const [selectedSession, setSelectedSession] = useState<string>('R');
  const [selectedDriver, setSelectedDriver] = useState<string>('VER');
  const [referenceDriver, setReferenceDriver] = useState<string>('HAM');
  const [availableDrivers, setAvailableDrivers] = useState<string[]>(['VER', 'HAM', 'LEC', 'NOR']);

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [stats, setStats] = useState<PreprocessingStats | null>(null);
  const [driverSummaries, setDriverSummaries] = useState<DriverSummary[]>([]);
  const [totalLaps, setTotalLaps] = useState<number>(0);

  // Models state
  const [regData, setRegData] = useState<RegressionResponse | null>(null);
  const [clfData, setClfData] = useState<ClassificationResponse | null>(null);
  const [clusterData, setClusterData] = useState<ClusteringResponse | null>(null);
  const [features, setFeatures] = useState<FeatureImportanceItem[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState<boolean>(false);

  // Telemetry trace state
  const [traceData, setTraceData] = useState<TelemetryCompareResponse | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        let driversToLoad = ['VER', 'HAM', 'LEC', 'NOR'];
        const sessRes = await fetchAvailableSessions();
        if (sessRes.sessions && sessRes.sessions.length > 0) {
          setSessions(sessRes.sessions);
          const first = sessRes.sessions[0];
          if (first.key_drivers && first.key_drivers.length > 0) {
            driversToLoad = first.key_drivers.slice(0, 6);
            setAvailableDrivers(driversToLoad);
          }
        }
        await handleLoadSession(2023, 'Monza', 'R', driversToLoad);
      } catch (err) {
        console.error('Init error:', err);
      }
    }
    init();
  }, []);

  const handleLoadSession = async (
    season = selectedSeason,
    gp = selectedGP,
    sess = selectedSession,
    drivers = availableDrivers
  ) => {
    setLoadingData(true);
    try {
      const res = await loadSessionData({
        season,
        grand_prix: gp,
        session_type: sess,
        drivers,
      });

      setStats(res.stats);
      setDriverSummaries(res.driver_summary || []);
      setTotalLaps(res.total_laps_analyzed || 0);

      // Fetch each model with individual fallback so one failure doesn't block the rest
      const [regRes, clfRes, clusterRes, featRes, traceRes] = await Promise.all([
        runRegression(0.25).catch((e) => {
          console.warn('Regression load error:', e);
          return null;
        }),
        runClassification(0.25).catch((e) => {
          console.warn('Classification load error:', e);
          return null;
        }),
        runClustering(3).catch((e) => {
          console.warn('Clustering load error:', e);
          return null;
        }),
        fetchFeatureImportance().catch((e) => {
          console.warn('Feature importance load error:', e);
          return { features: [] };
        }),
        fetchTelemetryComparison({
          season,
          grand_prix: gp,
          session_type: sess,
          driver_1: selectedDriver,
          driver_2: referenceDriver,
        }).catch((e) => {
          console.warn('Telemetry compare load error:', e);
          return null;
        }),
      ]);

      if (regRes) setRegData(regRes);
      if (clfRes) setClfData(clfRes);
      if (clusterRes) setClusterData(clusterRes);
      if (featRes?.features) setFeatures(featRes.features);
      if (traceRes) setTraceData(traceRes);
    } catch (err) {
      console.error('Session load error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const currentSummary = driverSummaries.find((d) => d.driver === selectedDriver);
  const currentLapTime = currentSummary?.best_lap_time || 84.82;
  const benchmarkLap = driverSummaries.length > 0
    ? Math.min(...driverSummaries.map((d) => d.best_lap_time))
    : 84.82;

  return (
    <div className="h-screen w-screen bg-[#080a0e] text-gray-200 flex flex-col overflow-hidden font-sans">
      {/* Main Workspace: Left Sidebar + View Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 bg-[#0a0c10] space-y-4">
          {/* 01: CORNER SIMULATOR (TRACK-SIDE EXPERIMENTATION WITH 3D GHOST DUEL & SECTOR PREDICTION) */}
          {activeTab === 'corner-simulator' && <CornerSimulator />}

          {/* 02: CORNER DELTA MAP & HEAD-TO-HEAD DUEL */}
          {activeTab === 'corner-delta' && <CornerDeltaView />}

          {/* 03: FEATURE ANALYSIS // SENSITIVITY WEIGHTS & GINI COEFFICIENTS */}
          {activeTab === 'features' && (
            <FeatureAnalysisView
              features={features}
              loading={featuresLoading || loadingData}
            />
          )}

          {/* 04: MACHINE LEARNING MODEL BENCHMARKS */}
          {activeTab === 'models' && (
            <ModelResultsView
              regressionData={regData}
              classificationData={clfData}
              clusteringData={clusterData}
              onRunRegression={(sz) => runRegression(sz).then(setRegData)}
              onRunClassification={(sz) => runClassification(sz).then(setClfData)}
              onRunClustering={(k) => runClustering(k).then(setClusterData)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
