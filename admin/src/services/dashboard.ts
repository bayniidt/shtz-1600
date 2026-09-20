import { fetchCases } from "@/services/cases";
import { fetchCareerCities, fetchCareerPositions } from "@/services/careers";

export interface DashboardStats {
  cases: number;
  cities: number;
  positions: number;
  hot: number;
}

/** 读取概览卡片所需的实时汇总数据。 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [cases, cities, positions, hotPositions] = await Promise.all([
    fetchCases({ page: 1, pageSize: 1 }),
    fetchCareerCities({ page: 1, pageSize: 1 }),
    fetchCareerPositions({ page: 1, pageSize: 1 }),
    fetchCareerPositions({ page: 1, pageSize: 1, hot: "true" }),
  ]);

  return {
    cases: cases.total,
    cities: cities.total,
    positions: positions.total,
    hot: hotPositions.total,
  };
}
