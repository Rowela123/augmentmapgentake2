interface StateMapping {
  [key: string]: string;
}

// Mapping of state names to their two-letter codes
export const STATE_NAMES_TO_CODES: StateMapping = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
  'District of Columbia': 'DC',
  'American Samoa': 'AS',
  'Guam': 'GU',
  'Northern Mariana Islands': 'MP',
  'Puerto Rico': 'PR',
  'U.S. Virgin Islands': 'VI'
};

// Mapping of state codes to their full names
export const STATE_CODES_TO_NAMES: StateMapping = 
  Object.entries(STATE_NAMES_TO_CODES).reduce(
    (acc, [name, code]) => {
      acc[code] = name;
      return acc;
    }, 
    {} as StateMapping
  );

/**
 * Converts a state name to its two-letter code
 * @param stateName The full name of the state
 * @returns The two-letter state code or empty string if not found
 */
export const stateNameToCode = (stateName: string): string => {
  return STATE_NAMES_TO_CODES[stateName] || '';
};

/**
 * Converts a state code to its full name
 * @param stateCode The two-letter state code
 * @returns The full state name or empty string if not found
 */
export const stateCodeToName = (stateCode: string): string => {
  return STATE_CODES_TO_NAMES[stateCode] || '';
};

/**
 * Gets the list of all state names
 * @returns Array of state names
 */
export const getAllStateNames = (): string[] => {
  return Object.keys(STATE_NAMES_TO_CODES);
};

/**
 * Gets the list of all state codes
 * @returns Array of state codes
 */
export const getAllStateCodes = (): string[] => {
  return Object.values(STATE_NAMES_TO_CODES);
}; 