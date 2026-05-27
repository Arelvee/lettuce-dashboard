import {
  Activity,
  Brain,
  Droplets,
  Gauge,
  Leaf,
  Power,
  ShieldCheck,
  ThermometerSun,
} from "lucide-react";
import PredictionHistoryChart from "../components/charts/PredictionHistoryChart";
import NutrientTrendChart from "../components/charts/NutrientTrendChart";
import SensorTrendChart from "../components/charts/SensorTrendChart";
import EmptyState from "../components/common/EmptyState";
import ActionList from "../components/dashboard/ActionList";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MetricCard from "../components/dashboard/MetricCard";
import OperationsPanel from "../components/dashboard/OperationsPanel";
import PredictionPanel from "../components/dashboard/PredictionPanel";
import SensorTile from "../components/dashboard/SensorTile";
import LocationPanel from "../components/location/LocationPanel";
import RecentReadingsTable from "../components/table/RecentReadingsTable";
import { useDashboardData } from "../hooks/useDashboardData";
import { formatDateTime, formatNumber, formatPercent } from "../utils/format";
import { getOverallHealth, SENSOR_META } from "../utils/health";

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
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase is not reachable from this browser session. Showing preview data until live rows load.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Brain}
          label="Growth Stage"
          value={latestPrediction?.growth_stage || "No prediction"}
          detail={latestPrediction ? formatDateTime(latestPrediction.timestamp) : "Waiting for ML output"}
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
          label="Predicted Yield"
          value={latestPrediction?.predicted_yield_g}
          unit="g"
          detail="Latest regressor output"
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

      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <PredictionPanel prediction={latestPrediction} />
        <OperationsPanel pumpEvent={latestPump} weather={latestWeather} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <LocationPanel profile={profile} latestReading={latestReading} />
        <ActionList latestReading={latestReading} />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          icon={ThermometerSun}
          label="Air Temp"
          value={latestReading?.atemp}
          unit="C"
          detail={`Water ${formatNumber(latestReading?.wtemp, 1)} C`}
          tone="rose"
        />
        <MetricCard
          icon={Droplets}
          label="Humidity"
          value={latestReading?.humidity}
          unit="%RH"
          detail={`pH ${formatNumber(latestReading?.ph, 2)}`}
          tone="sky"
        />
        <MetricCard
          icon={Activity}
          label="TDS / EC"
          value={latestReading ? `${formatNumber(latestReading.tds, 0)} / ${formatNumber(latestReading.ec, 0)}` : "--"}
          detail="ppm / uS/cm"
          tone="amber"
        />
        <MetricCard
          icon={Power}
          label="Pump"
          value={latestPump?.pump_on ? "On" : "Off"}
          detail={latestPump?.schedule}
          tone={latestPump?.pump_on ? "sky" : "slate"}
        />
      </section>

      {latestReading ? (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="section-title">Sensor Status</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Latest sample</h2>
            </div>
            <p className="hidden text-sm text-slate-500 sm:block">
              {formatDateTime(latestReading.timestamp)}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {sensorOrder.map((sensorKey) => (
              <SensorTile
                key={sensorKey}
                sensorKey={sensorKey}
                value={latestReading[sensorKey]}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No sensor readings yet"
          message="Start the Python simulator and wait for the first sample to appear."
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
  );
}

