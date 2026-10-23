import { PincodeLookupResult } from '@/types/api';

/**
 * High-frequency PIN codes lookup dataset for major Indian economic centers.
 */
export const PINCODE_DATABASE: Record<string, Omit<PincodeLookupResult, 'pincode' | 'isDeliverable'>> = {
  // Mumbai & Maharashtra
  '400001': { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', region: 'Western' },
  '400051': { city: 'Mumbai (BKC)', district: 'Mumbai Suburban', state: 'Maharashtra', region: 'Western' },
  '400076': { city: 'Mumbai (Powai)', district: 'Mumbai Suburban', state: 'Maharashtra', region: 'Western' },
  '400053': { city: 'Mumbai (Andheri West)', district: 'Mumbai Suburban', state: 'Maharashtra', region: 'Western' },
  '411001': { city: 'Pune', district: 'Pune', state: 'Maharashtra', region: 'Western' },
  '411057': { city: 'Pune (Hinjawadi)', district: 'Pune', state: 'Maharashtra', region: 'Western' },
  '440001': { city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', region: 'Western' },

  // Delhi NCR
  '110001': { city: 'New Delhi (Connaught Place)', district: 'Central Delhi', state: 'Delhi', region: 'Northern' },
  '110020': { city: 'New Delhi (Okhla)', district: 'South Delhi', state: 'Delhi', region: 'Northern' },
  '110092': { city: 'New Delhi (Laxmi Nagar)', district: 'East Delhi', state: 'Delhi', region: 'Northern' },
  '122001': { city: 'Gurugram', district: 'Gurugram', state: 'Haryana', region: 'Northern' },
  '122002': { city: 'Gurugram (DLF Cyber City)', district: 'Gurugram', state: 'Haryana', region: 'Northern' },
  '201301': { city: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', region: 'Northern' },

  // Bengaluru & Karnataka
  '560001': { city: 'Bengaluru (MG Road)', district: 'Bengaluru Urban', state: 'Karnataka', region: 'Southern' },
  '560100': { city: 'Bengaluru (Electronic City)', district: 'Bengaluru Urban', state: 'Karnataka', region: 'Southern' },
  '560037': { city: 'Bengaluru (Marathahalli)', district: 'Bengaluru Urban', state: 'Karnataka', region: 'Southern' },
  '560066': { city: 'Bengaluru (Whitefield)', district: 'Bengaluru Urban', state: 'Karnataka', region: 'Southern' },
  '570001': { city: 'Mysuru', district: 'Mysuru', state: 'Karnataka', region: 'Southern' },

  // Hyderabad & Telangana
  '500001': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', region: 'Southern' },
  '500081': { city: 'Hyderabad (Hitec City)', district: 'Rangareddy', state: 'Telangana', region: 'Southern' },
  '500032': { city: 'Hyderabad (Gachibowli)', district: 'Rangareddy', state: 'Telangana', region: 'Southern' },

  // Chennai & Tamil Nadu
  '600001': { city: 'Chennai (George Town)', district: 'Chennai', state: 'Tamil Nadu', region: 'Southern' },
  '600096': { city: 'Chennai (OMR / Perungudi)', district: 'Chennai', state: 'Tamil Nadu', region: 'Southern' },
  '641001': { city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', region: 'Southern' },

  // Kolkata & Eastern India
  '700001': { city: 'Kolkata (BBD Bagh)', district: 'Kolkata', state: 'West Bengal', region: 'Eastern' },
  '700091': { city: 'Kolkata (Salt Lake Sector V)', district: 'North 24 Parganas', state: 'West Bengal', region: 'Eastern' },
  '751001': { city: 'Bhubaneswar', district: 'Khurda', state: 'Odisha', region: 'Eastern' },

  // Gujarat
  '380001': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', region: 'Western' },
  '380015': { city: 'Ahmedabad (SG Highway)', district: 'Ahmedabad', state: 'Gujarat', region: 'Western' },
  '395001': { city: 'Surat', district: 'Surat', state: 'Gujarat', region: 'Western' },

  // Rajasthan
  '302001': { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', region: 'Northern' },
  '342001': { city: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', region: 'Northern' },

  // Madhya Pradesh
  '452001': { city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', region: 'Central' },
  '462001': { city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', region: 'Central' },

  // Uttar Pradesh & Bihar
  '226001': { city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', region: 'Northern' },
  '208001': { city: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', region: 'Northern' },
  '800001': { city: 'Patna', district: 'Patna', state: 'Bihar', region: 'Eastern' },

  // Punjab, Chandigarh & Kerala
  '160001': { city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', region: 'Northern' },
  '141001': { city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', region: 'Northern' },
  '682001': { city: 'Kochi', district: 'Ernakulam', state: 'Kerala', region: 'Southern' },
  '695001': { city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', region: 'Southern' },
};

/**
 * Resolves state and zone algorithmically from India Post 1st and 2nd digits
 * when an exact pin isn't pre-indexed.
 */
export function resolvePincodeFallback(pincode: string): PincodeLookupResult | null {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return null;
  }

  // Exact dataset hit
  if (PINCODE_DATABASE[pincode]) {
    return {
      pincode,
      ...PINCODE_DATABASE[pincode],
      isDeliverable: true,
    };
  }

  // Postal zone resolution logic (Postal Circle standards)
  const firstDigit = pincode[0];
  const firstTwo = pincode.substring(0, 2);

  let state = 'India';
  let region = 'National';

  switch (firstDigit) {
    case '1':
      region = 'Northern';
      if (firstTwo === '11') state = 'Delhi';
      else if (firstTwo === '12' || firstTwo === '13') state = 'Haryana';
      else if (firstTwo === '14' || firstTwo === '15') state = 'Punjab';
      else if (firstTwo === '16') state = 'Chandigarh';
      else if (firstTwo === '17') state = 'Himachal Pradesh';
      else if (firstTwo === '18' || firstTwo === '19') state = 'Jammu and Kashmir';
      break;
    case '2':
      region = 'Northern';
      if (['20', '21', '22', '23', '24', '25', '26', '27', '28'].includes(firstTwo)) {
        state = firstTwo === '24' || firstTwo === '26' ? 'Uttarakhand' : 'Uttar Pradesh';
      }
      break;
    case '3':
      region = 'Western';
      if (['30', '31', '32', '33', '34'].includes(firstTwo)) state = 'Rajasthan';
      else if (['36', '37', '38', '39'].includes(firstTwo)) state = 'Gujarat';
      break;
    case '4':
      region = 'Western / Central';
      if (['40', '41', '42', '43', '44'].includes(firstTwo)) state = 'Maharashtra';
      else if (['45', '46', '47', '48'].includes(firstTwo)) state = 'Madhya Pradesh';
      else if (firstTwo === '49') state = 'Chhattisgarh';
      break;
    case '5':
      region = 'Southern';
      if (['50'].includes(firstTwo)) state = 'Telangana';
      else if (['51', '52', '53'].includes(firstTwo)) state = 'Andhra Pradesh';
      else if (['56', '57', '58', '59'].includes(firstTwo)) state = 'Karnataka';
      break;
    case '6':
      region = 'Southern';
      if (['60', '61', '62', '63', '64'].includes(firstTwo)) state = 'Tamil Nadu';
      else if (['67', '68', '69'].includes(firstTwo)) state = 'Kerala';
      break;
    case '7':
      region = 'Eastern';
      if (['70', '71', '72', '73', '74'].includes(firstTwo)) state = 'West Bengal';
      else if (['75', '76', '77'].includes(firstTwo)) state = 'Odisha';
      else if (['78', '79'].includes(firstTwo)) state = 'Assam / North East';
      break;
    case '8':
      region = 'Eastern';
      if (['80', '81', '82', '83', '84', '85'].includes(firstTwo)) {
        state = ['82', '83'].includes(firstTwo) ? 'Jharkhand' : 'Bihar';
      }
      break;
    default:
      state = 'India';
  }

  return {
    pincode,
    city: `${state} Urban / District Center`,
    district: `${state} District`,
    state,
    region,
    isDeliverable: true,
  };
}
