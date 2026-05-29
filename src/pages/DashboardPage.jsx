import {
  Brain,
  Gauge,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import PredictionHistoryChart from "../components/charts/PredictionHistoryChart";
import NutrientTrendChart from "../components/charts/NutrientTrendChart";
import SensorTrendChart from "../components/charts/SensorTrendChart";
import EmptyState from "../components/common/EmptyState";
import ActionList from "../components/dashboard/ActionList";
import BatchPanel from "../components/dashboard/BatchPanel";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DeviceStatusPanel from "../components/dashboard/DeviceStatusPanel";
import MetricCard from "../components/dashboard/MetricCard";
import OperationsPanel from "../components/dashboard/OperationsPanel";
import PredictionPanel from "../components/dashboard/PredictionPanel";
import SensorTile from "../components/dashboard/SensorTile";
import LocationPanel from "../components/location/LocationPanel";
import RecentReadingsTable from "../components/table/RecentReadingsTable";
import { useDashboardData } from "../hooks/useDashboardData";
import { getDeviceConnectionStatus } from "../utils/deviceStatus";
import { formatDateTime, formatPercent } from "../utils/format";
import { getOverallHealth, SENSOR_META } from "../utils/health";
import { formatYieldCount, getPredictionStageInfo, getYieldCountInfo } from "../utils/prediction";

const sensorOrder = Object.keys(SENSOR_META);

export default function DashboardPage({ profile }) {
  const { data, loading, error, lastRefresh, refresh } = useDashboardData();
  const latestReading = data.sensorReadings?.[0];
  const latestPrediction = data.predictions?.[0];
  const latestPump = data.pumpEvents?.[0] || {
    pump_on: Boolean(latestReading?.pump_on),
    schedule: "06:00-18:00 Asia/Manila",
    timestamp: latestReading?.timestamp,
  };
  const latestWeather = data.weatherSnapshots?.[0];
  const health = getOverallHealth(latestReading);
  const stageInfo = getPredictionStageInfo(latestPrediction);
  const yieldInfo = getYieldCountInfo(latestPrediction);
  const connectionStatus = getDeviceConnectionStatus({
    latestReading,
    isMock: data.isMock,
    error,
  });

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader
        loading={loading}
        error={error}
        isMock={data.isMock}
        lastRefresh={lastRefresh}
        onRefresh={refresh}
        profile={profile}
      />

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
          Supabase is not reachable from this browser session. Showing preview data until live rows load.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Brain}
          label="Growth Stage"
          value={stageInfo.label}
          detail={
            latestPrediction
              ? `${stageInfo.classId === null ? "Classifier label" : `Class ${stageInfo.classId}`} / ${formatDateTime(latestPrediction.timestamp)}`
              : "Waiting for classifier output"
          }
          tone="emerald"
        />
        <MetricCard
          icon={Gauge}
          label="Confidence"
          value={formatPercent(latestPrediction?.stage_probability)}
          detail="XGBoost class probability"
          tone={Number(latestPrediction?.stage_probability || 0) >= 0.75 ? "emerald" : "amber"}
        />
        <MetricCard
          icon={Leaf}
          label="Yield Count"
          value={formatYieldCount(latestPrediction)}
          unit="heads"
          detail={
            yieldInfo.raw === null
              ? "Waiting for XGBoost regressor"
              : `XGBoost regressor / ${yieldInfo.count} of ${yieldInfo.slots} slots`
          }
          tone="sky"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Overall Health"
          value={health}
          unit="%"
          detail="Based on sensor target ranges"
          tone={health >= 85 ? "emerald" : health >= 65 ? "amber" : "rose"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(21rem,0.9fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <DeviceStatusPanel
            latestReading={latestReading}
            connectionStatus={connectionStatus}
            sensorKeys={sensorOrder}
          />

          {latestReading ? (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="section-title">Sensor Monitoring</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Live reading board</h2>
                </div>
                <p className="hidden text-sm text-slate-500 sm:block dark:text-slate-400">
                  {formatDateTime(latestReading.timestamp)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {sensorOrder.map((sensorKey) => (
                  <SensorTile
                    key={sensorKey}
                    sensorKey={sensorKey}
                    value={latestReading[sensorKey]}
                    connectionStatus={connectionStatus}
                  />
                ))}
              </div>
            </section>
          ) : (
            <EmptyState
              title="No sensor readings yet"
              message="ESP32 is offline or has not sent data yet. Check power, Wi-Fi, and the data upload service."
            />
          )}

          <section className="grid gap-4 xl:grid-cols-2">
            <SensorTrendChart readings={data.sensorReadings || []} />
            <NutrientTrendChart readings={data.sensorReadings || []} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <PredictionHistoryChart predictions={data.predictions || []} />
            <RecentReadingsTable readings={data.sensorReadings || []} />
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
          <BatchPanel
            cropBatches={data.cropBatches || []}
            isMock={data.isMock}
            latestPrediction={latestPrediction}
            onRefresh={refresh}
          />
          <PredictionPanel prediction={latestPrediction} />
          <OperationsPanel pumpEvent={latestPump} weather={latestWeather} />
          <ActionList latestReading={latestReading} connectionStatus={connectionStatus} />
        </aside>
      </section>

      <LocationPanel profile={profile} latestReading={latestReading} />
    </div>
  );
}
