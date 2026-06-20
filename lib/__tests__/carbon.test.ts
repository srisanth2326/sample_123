import { calculateFootprint, FootprintInputs } from '../carbon';

describe('Carbon Footprint Calculator engine', () => {
  test('calculates correct annual emissions for a low-impact user', () => {
    const lowImpactInputs: FootprintInputs = {
      carType: 'none',
      carKmPerWeek: 0,
      publicTransitKmWeek: 0,
      shortFlightsPerYear: 0,
      longFlightsPerYear: 0,
      homeSize: 20,
      heatingSource: 'renewable',
      renewableTariff: true,
      dietType: 'vegan',
      shoppingFrequency: 'low',
    };

    const result = calculateFootprint(lowImpactInputs);

    expect(result.transport).toBe(0);
    // electricity: 20m² * 25kWh/m² * 0.05kg/kWh = 25kg CO2
    // heating: 20m² * 80kWh/m² * 0.02kg/kWh = 32kg CO2
    // home total = 25 + 32 = 57kg CO2
    expect(result.home).toBe(57);
    expect(result.food).toBe(1055);
    expect(result.goods).toBe(600);
    expect(result.total).toBe(1712);
  });

  test('calculates correct annual emissions for a moderate-impact user', () => {
    const moderateInputs: FootprintInputs = {
      carType: 'hybrid',
      carKmPerWeek: 150,
      publicTransitKmWeek: 50,
      shortFlightsPerYear: 2,
      longFlightsPerYear: 0,
      homeSize: 80,
      heatingSource: 'gas',
      renewableTariff: false,
      dietType: 'mixed',
      shoppingFrequency: 'moderate',
    };

    const result = calculateFootprint(moderateInputs);

    // Car: 150 * 52 * 0.100 = 780
    // Transit: 50 * 52 * 0.050 = 130
    // Flights: 2 * 250 = 500
    // Transport total = 1410
    expect(result.transport).toBe(1410);

    // Electricity: 80m² * 25 * 0.370 = 740
    // Heating: 80m² * 80 * 0.180 = 1152
    // Home total = 1892
    expect(result.home).toBe(1892);
    expect(result.food).toBe(2055);
    expect(result.goods).toBe(1200);
    expect(result.total).toBe(6557);
  });

  test('calculates correct annual emissions for a high-impact user', () => {
    const highInputs: FootprintInputs = {
      carType: 'petrol',
      carKmPerWeek: 500,
      publicTransitKmWeek: 0,
      shortFlightsPerYear: 5,
      longFlightsPerYear: 2,
      homeSize: 250,
      heatingSource: 'oil',
      renewableTariff: false,
      dietType: 'highMeat',
      shoppingFrequency: 'high',
    };

    const result = calculateFootprint(highInputs);

    // Car: 500 * 52 * 0.170 = 4420
    // Flights: 5 * 250 + 2 * 1100 = 3450
    // Transport total = 7870
    expect(result.transport).toBe(7870);

    // Electricity: 250 * 25 * 0.370 = 2312.5
    // Heating: 250 * 80 * 0.260 = 5200
    // Home total = 7512.5 -> rounds to 7513
    expect(result.home).toBe(7513);
    expect(result.food).toBe(2650);
    expect(result.goods).toBe(2000);
    expect(result.total).toBe(20033);
  });
});
