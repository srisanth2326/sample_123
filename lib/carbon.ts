// EcoTrack Carbon Calculation Engine
// Emission factors are based on peer-reviewed and official governmental databases:
// - UK DEFRA (Department for Environment, Food & Rural Affairs) 2023 greenhouse gas reporting factors
// - US EPA (Environmental Protection Agency) Emission Factors for Greenhouse Gas Inventories
// - Poore & Nemecek (2018), Science: "Reducing food’s environmental impacts through producers and consumers"

// Emission Factors (in kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Transport factors (per km)
  car: {
    petrol: 0.170,  // Average petrol car: 170g CO2e/km (DEFRA 2023)
    diesel: 0.171,  // Average diesel car: 171g CO2e/km (DEFRA 2023)
    hybrid: 0.100,  // Average hybrid car: 100g CO2e/km (DEFRA 2023)
    ev: 0.050,      // Electric vehicle with average grid mix: 50g CO2e/km (EPA / DEFRA)
    none: 0,
  },
  publicTransit: 0.050, // Average bus/rail travel: 50g CO2e/km (DEFRA 2023)
  
  // Flight factors (per flight event, average distances: short-haul ~1000km, long-haul ~6000km)
  flight: {
    shortHaul: 250.0,  // Short-haul flight (<3 hours): ~250 kg CO2e (DEFRA 2023)
    longHaul: 1100.0,   // Long-haul flight (>3 hours): ~1100 kg CO2e (DEFRA 2023)
  },

  // Home energy factors (electricity and heating usage estimated per m² per year)
  energyDemand: {
    electricityPerM2: 25, // kWh/m²/year
    heatingPerM2: 80,      // kWh/m²/year
  },
  heating: {
    gas: 0.180,         // Natural gas: 0.180 kg CO2e/kWh (DEFRA 2023)
    electricity: 0.370, // Standard grid electricity: 0.370 kg CO2e/kWh (EPA eGRID average)
    oil: 0.260,         // Heating oil: 0.260 kg CO2e/kWh (DEFRA 2023)
    renewable: 0.020,   // Solar, heat pump, biomass: 0.020 kg CO2e/kWh lifecycle emissions
  },
  electricityTariff: {
    standard: 0.370,    // Standard grid mix: 0.370 kg CO2e/kWh
    renewable: 0.050,   // Green/renewable tariff lifecycle emissions: 0.050 kg CO2e/kWh
  },

  // Diet factors (annual emissions in kg CO2e per person)
  // Based on Poore & Nemecek (2018) published in Science
  diet: {
    vegan: 1055,      // ~2.89 kg CO2e/day
    vegetarian: 1390, // ~3.81 kg CO2e/day
    lowMeat: 1705,    // ~4.67 kg CO2e/day
    mixed: 2055,      // ~5.63 kg CO2e/day
    highMeat: 2650,   // ~7.26 kg CO2e/day
  },

  // Goods / Consumption factors (annual emissions in kg CO2e per person)
  shopping: {
    low: 600,         // Minimalist, high reuse, recycling
    moderate: 1200,   // Average buying habits, standard recycling
    high: 2000,       // High consumerism, frequent new items, minimal recycling
  }
};

export interface FootprintInputs {
  carType: string;
  carKmPerWeek: number;
  publicTransitKmWeek: number;
  shortFlightsPerYear: number;
  longFlightsPerYear: number;
  homeSize: number;
  heatingSource: string;
  renewableTariff: boolean;
  dietType: string;
  shoppingFrequency: string;
}

export interface CalculatedFootprint {
  transport: number;
  home: number;
  food: number;
  goods: number;
  total: number;
}

/**
 * Calculates the annual carbon footprint in kg CO2e based on onboarding inputs
 */
export function calculateFootprint(inputs: FootprintInputs): CalculatedFootprint {
  // 1. Transport Calculations
  const carFactor = EMISSION_FACTORS.car[inputs.carType as keyof typeof EMISSION_FACTORS.car] || 0;
  const annualCarCO2 = inputs.carKmPerWeek * 52 * carFactor;
  
  const annualTransitCO2 = inputs.publicTransitKmWeek * 52 * EMISSION_FACTORS.publicTransit;
  
  const annualShortFlightsCO2 = inputs.shortFlightsPerYear * EMISSION_FACTORS.flight.shortHaul;
  const annualLongFlightsCO2 = inputs.longFlightsPerYear * EMISSION_FACTORS.flight.longHaul;
  
  const transportTotal = annualCarCO2 + annualTransitCO2 + annualShortFlightsCO2 + annualLongFlightsCO2;

  // 2. Home Energy Calculations
  const elecDemand = inputs.homeSize * EMISSION_FACTORS.energyDemand.electricityPerM2;
  const heatDemand = inputs.homeSize * EMISSION_FACTORS.energyDemand.heatingPerM2;
  
  const elecFactor = inputs.renewableTariff 
    ? EMISSION_FACTORS.electricityTariff.renewable 
    : EMISSION_FACTORS.electricityTariff.standard;
  
  const annualElecCO2 = elecDemand * elecFactor;
  
  const heatFactor = EMISSION_FACTORS.heating[inputs.heatingSource as keyof typeof EMISSION_FACTORS.heating] || EMISSION_FACTORS.heating.electricity;
  const annualHeatCO2 = heatDemand * heatFactor;
  
  const homeTotal = annualElecCO2 + annualHeatCO2;

  // 3. Diet Calculations
  const foodTotal = EMISSION_FACTORS.diet[inputs.dietType as keyof typeof EMISSION_FACTORS.diet] || EMISSION_FACTORS.diet.mixed;

  // 4. Goods/Consumption Calculations
  const goodsTotal = EMISSION_FACTORS.shopping[inputs.shoppingFrequency as keyof typeof EMISSION_FACTORS.shopping] || EMISSION_FACTORS.shopping.moderate;

  const total = transportTotal + homeTotal + foodTotal + goodsTotal;

  return {
    transport: Math.round(transportTotal),
    home: Math.round(homeTotal),
    food: Math.round(foodTotal),
    goods: Math.round(goodsTotal),
    total: Math.round(total)
  };
}

// Predefined actions in the Action Library with their environmental impact properties
export interface ActionLibraryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  co2SavedPerOccurrence: number; // in kg CO2e
  effort: 'easy' | 'medium' | 'hard';
  cost: 'saves money' | 'neutral' | 'costs money';
  icon: string;
}

export const ACTION_LIBRARY: ActionLibraryItem[] = [
  {
    id: 'bike',
    title: 'Walk / Bike instead of Driving',
    category: 'Transport',
    description: 'Replaced a typical 5km car trip by walking or cycling.',
    co2SavedPerOccurrence: 0.85, // 5km * 0.170 kg/km
    effort: 'medium',
    cost: 'saves money',
    icon: 'Bike'
  },
  {
    id: 'transit',
    title: 'Public Transit Shift',
    category: 'Transport',
    description: 'Took a train or bus for a 15km journey instead of driving.',
    co2SavedPerOccurrence: 1.8, // 15km * (0.170 - 0.050)
    effort: 'medium',
    cost: 'saves money',
    icon: 'Bus'
  },
  {
    id: 'plant_meal',
    title: 'Plant-Based Meal Swap',
    category: 'Food',
    description: 'Chose a fully plant-based meal instead of a beef or meat dish.',
    co2SavedPerOccurrence: 1.5, // Estimated savings from meat production offset
    effort: 'easy',
    cost: 'neutral',
    icon: 'Utensils'
  },
  {
    id: 'thermostat',
    title: 'Lower Thermostat (1°C)',
    category: 'Home',
    description: 'Lowered heating target by 1°C for 24 hours to reduce heating load.',
    co2SavedPerOccurrence: 1.2, // ~10% reduction in heating emissions per day
    effort: 'easy',
    cost: 'saves money',
    icon: 'Thermometer'
  },
  {
    id: 'unplug',
    title: 'Unplug Vampire Loads',
    category: 'Home',
    description: 'Turned off standby power strips and appliances for the day.',
    co2SavedPerOccurrence: 0.4, // Prevents ~1 kWh of idle load
    effort: 'easy',
    cost: 'saves money',
    icon: 'PlugZap'
  },
  {
    id: 'dry_clothes',
    title: 'Air-Dry Laundry',
    category: 'Home',
    description: 'Air-dried a load of laundry instead of using the electric clothes dryer.',
    co2SavedPerOccurrence: 1.8, // Replaces average dryer cycle energy (~4.8 kWh * grid factor)
    effort: 'easy',
    cost: 'saves money',
    icon: 'Wind'
  },
  {
    id: 'reusable_cup',
    title: 'Zero-Waste Cup & Bag',
    category: 'Goods',
    description: 'Avoided single-use coffee cups and shopping bags.',
    co2SavedPerOccurrence: 0.2,
    effort: 'easy',
    cost: 'saves money',
    icon: 'ShoppingBag'
  },
  {
    id: 'skipped_flight',
    title: 'Virtual Meeting / Skipped Short Flight',
    category: 'Transport',
    description: 'Cancelled or replaced one short-haul flight with remote options.',
    co2SavedPerOccurrence: 250.0,
    effort: 'hard',
    cost: 'saves money',
    icon: 'Video'
  }
];
