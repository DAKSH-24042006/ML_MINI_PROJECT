import React, { useState, useEffect } from 'react';
import { Sidebar, ViewTab } from './components/Sidebar';
import { TelemetryHeader } from './components/TelemetryHeader';
import { CircuitMap } from './components/CircuitMap';
import { StackedTelemetryCanvas } from './components/StackedTelemetryCanvas';
import { LapAnalysisView } from './components/LapAnalysisView';
import { SimulatorView } from './components/SimulatorView';
import { DriverComparisonView } from './components/DriverComparisonView';
import { FeatureAnalysisView } from './components/FeatureAnalysisView';
import { ModelResultsView } from './components/ModelResultsView';
import { MetricsOverview } from './components/MetricsOverview';
import { DriverComparison } from './components/DriverComparison';
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
  const [activeTab, setActiveTab] = useState<ViewTab>('telemetry');

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
        const sessRes = await fetchAvailableSessions();
        if (sessRes.sessions && sessRes.sessions.length > 0) {
          setSessions(sessRes.sessions);
          const first = sessRes.sessions[0];
          if (first.key_drivers) setAvailableDrivers(first.key_drivers.slice(0, 6));
        }
        await handleLoadSession(2023, 'Monza', 'R');
      } catch (err) {
        console.error('Init error:', err);
      }
    }
    init();
  }, []);

  const handleLoadSession = async (
    season = selectedSeason,
    gp = selectedGP,
    sess = selectedSession
  ) => {
    setLoadingData(true);
    try {
      const res = await loadSessionData({
        season,
        grand_prix: gp,
        session_type: sess,
        drivers: availableDrivers,
      });

      setStats(res.stats);
      setDriverSummaries(res.driver_summary || []);
      setTotalLaps(res.total_laps_analyzed || 0);

      // Fetch all models & telemetry concurrently
      const [regRes, clfRes, clusterRes, featRes, traceRes] = await Promise.all([
        runRegression(0.25),
        runClassification(0.25),
        runClustering(3),
        fetchFeatureImportance(),
        fetchTelemetryComparison({
          season,
          grand_prix: gp,
          session_type: sess,
          driver_1: selectedDriver,
          driver_2: referenceDriver,
        }),
      ]);

      setRegData(regRes);
      setClfData(clfRes);
      setClusterData(clusterRes);
      setFeatures(featRes.features || []);
      setTraceData(traceRes);
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
      {/* Slim Persistent Timing Header */}
      <TelemetryHeader
        sessions={sessions}
        selectedSeason={selectedSeason}
        selectedGP={selectedGP}
        selectedSession={selectedSession}
        selectedDriver={selectedDriver}
        availableDrivers={availableDrivers}
        benchmarkLap={benchmarkLap}
        currentLapTime={currentLapTime}
        loading={loadingData}
        onSeasonChange={setSelectedSeason}
        onGPChange={(gp) => {
          setSelectedGP(gp);
          handleLoadSession(selectedSeason, gp, selectedSession);
        }}
        onSessionChange={setSelectedSession}
        onDriverChange={(drv) => {
          setSelectedDriver(drv);
          fetchTelemetryComparison({
            season: selectedSeason,
            grand_prix: selectedGP,
            session_type: selectedSession,
            driver_1: drv,
            driver_2: referenceDriver,
          }).then(setTraceData);
        }}
        onReload={() => handleLoadSession()}
      />

      {/* Main Workspace: Left Sidebar + View Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 bg-[#0a0c10] space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 font-mono">
              <MetricsOverview driverSummaries={driverSummaries} totalLaps={totalLaps} />
              <DriverComparison drivers={driverSummaries} />
            </div>
          )}

          {/* TAB 2: TELEMETRY (MAIN RACE ENGINEERING SCREEN) */}
          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <StackedTelemetryCanvas
                  data={traceData}
                  driver1={selectedDriver}
                  driver2={referenceDriver}
                />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-4">
                <CircuitMap trackName={selectedGP} />
                <div className="f1-panel p-3 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-[#18202d] text-gray-400">
                    <span>ACTIVE DRIVER: {selectedDriver}</span>
                    <span className="text-red-500 font-bold">STINT ACTIVE</span>
                  </div>
                  <div className="pt-2 space-y-1 text-gray-400 text-[11px]">
                    <div className="flex justify-between">
                      <span>BEST LAP:</span>
                      <span className="text-white font-bold">{currentLapTime.toFixed(3)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AVERAGE VELOCITY:</span>
                      <span className="text-cyan-300 font-bold">{currentSummary?.avg_speed.toFixed(1) || '248.5'} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WOT THROTTLE %:</span>
                      <span className="text-emerald-400 font-bold">{currentSummary?.avg_full_throttle.toFixed(1) || '74.2'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BRAKING RATIO:</span>
                      <span className="text-rose-400 font-bold">{currentSummary?.avg_braking.toFixed(1) || '13.5'}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAP ANALYSIS */}
          {activeTab === 'lap-analysis' && (
            <LapAnalysisView
              driverSummaries={driverSummaries}
              selectedDriver={selectedDriver}
            />
          )}

          {/* TAB 4: SIMULATOR (WHAT-IF TELEMETRY PREDICTOR) */}
          {activeTab === 'simulator' && <SimulatorView />}

          {/* TAB 5: DRIVER COMPARE */}
          {activeTab === 'driver-compare' && (
            <DriverComparisonView
              telemetryData={traceData}
              driverSummaries={driverSummaries}
              driver1={selectedDriver}
              driver2={referenceDriver}
              onDriver1Change={(d) => {
                setSelectedDriver(d);
                fetchTelemetryComparison({
                  season: selectedSeason,
                  grand_prix: selectedGP,
                  session_type: selectedSession,
                  driver_1: d,
                  driver_2: referenceDriver,
                }).then(setTraceData);
              }}
              onDriver2Change={(d) => {
                setReferenceDriver(d);
                fetchTelemetryComparison({
                  season: selectedSeason,
                  grand_prix: selectedGP,
                  session_type: selectedSession,
                  driver_1: selectedDriver,
                  driver_2: d,
                }).then(setTraceData);
              }}
              availableDrivers={availableDrivers}
            />
          )}

          {/* TAB 6: FEATURE ANALYSIS */}
          {activeTab === 'features' && (
            <FeatureAnalysisView features={features} loading={featuresLoading} />
          )}

          {/* TAB 7: MODEL RESULTS */}
          {activeTab === 'models' && (
            <ModelResultsView
              regressionData={regData}
              classificationData={clfData}
              clusteringData={clusterData}
              onRunRegression={runRegression}
              onRunClassification={runClassification}
              onRunClustering={runClustering}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
