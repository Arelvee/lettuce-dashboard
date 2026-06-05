import {
  HeartPulse,
  PackageCheck,
  ScanSearch,
  Sprout,
} from "lucide-react";
import { useState } from "react";
import PredictionHistoryChart from "../components/charts/PredictionHistoryChart";
import NutrientTrendChart from "../components/charts/NutrientTrendChart";
import SensorTrendChart from "../components/charts/SensorTrendChart";
import ActionList from "../components/dashboard/ActionList";
import BatchPanel from "../components/dashboard/BatchPanel";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DeviceStatusPanel from "../components/dashboard/DeviceStatusPanel";
import EnvironmentCanopyPanel from "../components/dashboard/EnvironmentCanopyPanel";
import MetricCard from "../components/dashboard/MetricCard";
import OperationsPanel from "../components/dashboard/OperationsPanel";
import PredictionDetailModal from "../components/dashboard/PredictionDetailModal";
import WaterTankPanel from "../components/dashboard/WaterTankPanel";
import LocationPanel from "../components/location/LocationPanel";
import RecentReadingsTable from "../components/table/RecentReadingsTable";
import { useDashboardData } from "../hooks/useDashboardData";
import { getDeviceConnectionStatus } from "../utils/deviceStatus";
import { formatDateTime, formatNumber, formatPercent } from "../utils/format";
import { getOverallHealth, SENSOR_META } from "../utils/health";
import {
  formatYieldCount,
  getBatchAgeDays,
  getPredictionConfidence,
  getPredictionFreshness,
  getPredictionStageInfo,
  getYieldCountInfo,
} from "../utils/prediction";

const waterSensorOrder = ["wtemp", "ph", "tds", "ec"];
const allSensorOrder = Object.keys(SENSOR_META);
const environmentSensorOrder = allSensorOrder.filter((sensorKey) => !waterSensorOrder.includes(sensorKey));

export default function DashboardPage({ profile }) {
  const { data, loading, error, lastRefresh, refresh } = useDashboardData();
  const [detailType, setDetailType] = useState(null);
  const latestReading = data.sensorReadings?.[0];
  const rawLatestPrediction = data.predictions?.[0];
  const predictionFreshness = getPredictionFreshness(rawLatestPrediction, latestReading);
  const latestPrediction = data.isMock || predictionFreshness.isFresh ? rawLatestPrediction : null;
  const stalePrediction = rawLatestPrediction && !latestPrediction ? rawLatestPrediction : null;
  const latestPump = data.pumpEvents?.[0] || {
    pump_on: Boolean(latestReading?.pump_on),
    schedule: "06:00-18:00 Asia/Manila",
    timestamp: latestReading?.timestamp,
  };
  const latestWeather = data.weatherSnapshots?.[0];
  const health = getOverallHealth(latestReading);
  const stageSource = latestPrediction || latestReading;
  const stageInfo = getPredictionStageInfo(stageSource);
  const yieldInfo = getYieldCountInfo(latestPrediction);
  const confidence = getPredictionConfidence(latestPrediction) ?? getPredictionConfidence(latestReading);
  const cropAgeDays = getBatchAgeDays(latestPrediction, latestReading);
  const connectionStatus = getDeviceConnectionStatus({
    latestReading,
    isMock: data.isMock,
    error,
  });
  const stageDetail = latestPrediction
    ? `${stageInfo.classId === null ? "Classifier label" : `Class ${stageInfo.classId}`} / ${
        cropAgeDays === null ? "age pending" : `${formatNumber(cropAgeDays, 1)} days`
      } / ${formatDateTime(latestPrediction.timestamp)}`
    : latestReading
      ? `Current age-stage / ${cropAgeDays === null ? "age pending" : `${formatNumber(cropAgeDays, 1)} days`} / ${formatDateTime(latestReading.timestamp)}`
      : "Waiting for classifier output";
  const confidenceDetail = latestPrediction
    ? "Fresh XGBoost class probability"
    : stalePrediction
      ? `Age-stage confidence; stale ML from ${formatDateTime(stalePrediction.timestamp)}`
      : "Age-stage confidence until ML window completes";

  return (
    <div className="flex flex-col gap-6">
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

      <section className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Sprout}
          label="Growth Stage"
          value={stageInfo.label}
          detail={stageDetail}
          tone="emerald"
          onClick={() => setDetailType("stage")}
        />
        <MetricCard
          icon={ScanSearch}
          label="Confidence"
          value={confidence === null ? "--" : formatPercent(confidence)}
          detail={confidenceDetail}
          tone={Number(confidence || 0) >= 0.75 ? "emerald" : "amber"}
        />
        <MetricCard
          icon={PackageCheck}
          label="Yield Count"
          value={formatYieldCount(latestPrediction)}
          unit="heads"
          detail={
            yieldInfo.raw === null
              ? stalePrediction
                ? `Waiting for fresh 10-sample ML window; stale row ${formatDateTime(stalePrediction.timestamp)}`
                : "Waiting for fresh 10-sample ML window"
              : `Fresh XGBoost regressor / ${yieldInfo.count} of ${yieldInfo.slots} slots`
          }
          tone="sky"
          onClick={() => setDetailType("yield")}
        />
        <MetricCard
          icon={HeartPulse}
          label="Overall Health"
          value={String(health)}
          unit="%"
          detail="Target-fit score across live sensor ranges"
          tone={health >= 85 ? "emerald" : health >= 65 ? "amber" : "rose"}
        />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.9fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <DeviceStatusPanel
            latestReading={latestReading}
            connectionStatus={connectionStatus}
            sensorKeys={allSensorOrder}
          />

          <WaterTankPanel
            latestReading={latestReading}
            pumpEvent={latestPump}
            connectionStatus={connectionStatus}
          />

          <EnvironmentCanopyPanel
            latestReading={latestReading}
            connectionStatus={connectionStatus}
            sensorKeys={environmentSensorOrder}
          />

          <section className="grid auto-rows-fr items-stretch gap-5 xl:grid-cols-2">
            <SensorTrendChart readings={data.sensorReadings || []} />
            <NutrientTrendChart readings={data.sensorReadings || []} />
          </section>

          <section className="grid auto-rows-fr items-stretch gap-5 xl:grid-cols-2">
            <PredictionHistoryChart predictions={data.predictions || []} />
            <RecentReadingsTable readings={data.sensorReadings || []} />
          </section>
        </div>

        <aside className="grid min-w-0 auto-rows-fr gap-5 md:grid-cols-2 xl:sticky xl:top-24 xl:flex xl:flex-col xl:self-start">
          <BatchPanel
            cropBatches={data.cropBatches || []}
            isMock={data.isMock}
            latestReading={latestReading}
            latestPrediction={latestPrediction}
            onRefresh={refresh}
          />
          <OperationsPanel weather={latestWeather} />
          <ActionList latestReading={latestReading} connectionStatus={connectionStatus} />
        </aside>
      </section>

      <section className="pt-1">
        <LocationPanel profile={profile} latestReading={latestReading} />
      </section>

      <PredictionDetailModal
        type={detailType}
        prediction={latestPrediction}
        stalePrediction={stalePrediction}
        latestReading={latestReading}
        cropBatches={data.cropBatches || []}
        onClose={() => setDetailType(null)}
      />
    </div>
  );
}
