import { calculateFootprint, FootprintInputs } from '../carbon';

console.log("=========================================");
console.log("   RUNNING ECOTRACK CALCULATION TESTS    ");
console.log("=========================================");

let passes = 0;
let failures = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passes++;
  } catch (error: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(error);
    failures++;
  }
}

runTest('Low-impact user footprint calculation', () => {
  const inputs: FootprintInputs = {
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
  const res = calculateFootprint(inputs);
  if (res.transport !== 0) throw new Error(`Transport expected 0, got ${res.transport}`);
  if (res.home !== 57) throw new Error(`Home expected 57, got ${res.home}`);
  if (res.food !== 1055) throw new Error(`Food expected 1055, got ${res.food}`);
  if (res.goods !== 600) throw new Error(`Goods expected 600, got ${res.goods}`);
  if (res.total !== 1712) throw new Error(`Total expected 1712, got ${res.total}`);
});

runTest('Moderate-impact user footprint calculation', () => {
  const inputs: FootprintInputs = {
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
  const res = calculateFootprint(inputs);
  if (res.transport !== 1410) throw new Error(`Transport expected 1410, got ${res.transport}`);
  if (res.home !== 1892) throw new Error(`Home expected 1892, got ${res.home}`);
  if (res.food !== 2055) throw new Error(`Food expected 2055, got ${res.food}`);
  if (res.goods !== 1200) throw new Error(`Goods expected 1200, got ${res.goods}`);
  if (res.total !== 6557) throw new Error(`Total expected 6557, got ${res.total}`);
});

runTest('High-impact user footprint calculation', () => {
  const inputs: FootprintInputs = {
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
  const res = calculateFootprint(inputs);
  if (res.transport !== 7870) throw new Error(`Transport expected 7870, got ${res.transport}`);
  if (res.home !== 7513) throw new Error(`Home expected 7513, got ${res.home}`);
  if (res.food !== 2650) throw new Error(`Food expected 2650, got ${res.food}`);
  if (res.goods !== 2000) throw new Error(`Goods expected 2000, got ${res.goods}`);
  if (res.total !== 20033) throw new Error(`Total expected 20033, got ${res.total}`);
});

console.log("=========================================");
console.log(`Summary: ${passes} passed, ${failures} failed.`);
console.log("=========================================");

if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
