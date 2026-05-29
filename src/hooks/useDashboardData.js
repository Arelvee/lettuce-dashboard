import { useCallback, useEffect, useMemo, useState } from "react";
import { REFRESH_SECONDS, TABLES } from "../config/supabase";
import { createMockDashboardData } from "../data/mockData";
import { fetchDashboardTables } from "../services/supabaseRest";

function hasRows(payload) {
  return (
    payload.cropBatches?.length ||
    payload.sensorReadings?.length ||
    payload.predictions?.length ||
    payload.pumpEvents?.length ||
    payload.weatherSnapshots?.length
  );
}

export function useDashboardData() {
  const mock = useMemo(() => createMockDashboardData(), []);
  const [data, setData] = useState(mock);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDashboardTables(TABLES);
      if (hasRows(response)) {
        setData({ ...response, isMock: false });
      } else {
        setData(mock);
      }
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setData(mock);
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [mock]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, REFRESH_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    refreshSeconds: REFRESH_SECONDS,
  };
}
