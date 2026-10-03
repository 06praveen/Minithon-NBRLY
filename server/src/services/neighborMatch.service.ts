import { LocationService } from './location.service.js';

export interface MatchResult {
  score: number;
  reasons: string[];
}

export interface MatchInputs {
  userNeighborhood: string;
  userSkills: string[];
  userLat?: number | null;
  userLng?: number | null;
  requestNeighborhood: string;
  requestCategory: string;
  requestUrgency: 'URGENT' | 'TODAY' | 'FLEXIBLE';
  requestDate: string;
  requestLat?: number | null;
  requestLng?: number | null;
}

export class NeighborMatchService {
  /**
   * Deterministic matching algorithm based on:
   * - Same neighborhood / distance = +40
   * - Category/skill match = +25
   * - Availability/time match = +20
   * - Urgency compatibility = +10
   * - Distance / close proximity = +5
   * Total = 100 max
   */
  static calculateMatch(inputs: MatchInputs): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    const normUserNeigh = inputs.userNeighborhood ? inputs.userNeighborhood.trim().toLowerCase() : '';
    const normReqNeigh = inputs.requestNeighborhood ? inputs.requestNeighborhood.trim().toLowerCase() : '';

    // Calculate actual distance if coordinates are present
    let actualDistanceKm: number | null = null;
    if (
      inputs.userLat !== undefined && inputs.userLat !== null &&
      inputs.userLng !== undefined && inputs.userLng !== null &&
      inputs.requestLat !== undefined && inputs.requestLat !== null &&
      inputs.requestLng !== undefined && inputs.requestLng !== null
    ) {
      actualDistanceKm = LocationService.calculateDistanceKm(
        inputs.userLat,
        inputs.userLng,
        inputs.requestLat,
        inputs.requestLng
      );
    }

    // 1. Neighborhood / Proximity Match (+40)
    if (actualDistanceKm !== null) {
      if (actualDistanceKm <= 1.5) {
        score += 40;
        reasons.push(`Very close proximity (${actualDistanceKm} km away)`);
      } else if (actualDistanceKm <= 5.0) {
        score += 32;
        reasons.push(`Nearby neighborhood (${actualDistanceKm} km away)`);
      } else if (actualDistanceKm <= 10.0) {
        score += 20;
        reasons.push(`Within 10 km radius (${actualDistanceKm} km away)`);
      } else {
        score += 10;
        reasons.push(`Wider area (${actualDistanceKm} km away)`);
      }
    } else if (normUserNeigh && normReqNeigh && normUserNeigh === normReqNeigh) {
      score += 40;
      reasons.push(`Same neighborhood (${inputs.requestNeighborhood})`);
    } else if (
      (normUserNeigh.includes('bandra') && normReqNeigh.includes('bandra')) ||
      (normUserNeigh.includes('khar') && normReqNeigh.includes('bandra')) ||
      (normUserNeigh.includes('santacruz') && normReqNeigh.includes('khar'))
    ) {
      score += 25;
      reasons.push(`Adjacent neighborhood proximity (< 1.5 km)`);
    }

    // 2. Category / Skill alignment (+25)
    const normCat = inputs.requestCategory.toLowerCase();
    const hasMatchingSkill = inputs.userSkills.some((skill) => {
      const s = skill.toLowerCase();
      if (normCat.includes('tech') && (s.includes('tech') || s.includes('computer') || s.includes('phone'))) return true;
      if (normCat.includes('health') && (s.includes('health') || s.includes('medicine') || s.includes('first aid'))) return true;
      if (normCat.includes('errand') && (s.includes('errand') || s.includes('grocery'))) return true;
      if (normCat.includes('educat') && (s.includes('educat') || s.includes('math') || s.includes('tutor') || s.includes('science'))) return true;
      if (normCat.includes('elder') && (s.includes('elder') || s.includes('care') || s.includes('companion'))) return true;
      if (normCat.includes('house') && (s.includes('house') || s.includes('diy') || s.includes('repair') || s.includes('assembly'))) return true;
      if (normCat.includes('transport') && (s.includes('transport') || s.includes('ride') || s.includes('drive'))) return true;
      return s.includes(normCat) || normCat.includes(s);
    });

    if (hasMatchingSkill) {
      score += 25;
      reasons.push(`Direct skill match for ${inputs.requestCategory}`);
    } else if (inputs.userSkills.length > 0) {
      score += 15;
      reasons.push(`Active helper in general community tasks`);
    }

    // 3. Availability / Scheduling match (+20)
    if (inputs.requestDate.toLowerCase().includes('today') || inputs.requestDate.toLowerCase().includes('now')) {
      score += 20;
      reasons.push('Active neighbor available in current shift');
    } else {
      score += 15;
      reasons.push('Flexible scheduling window alignment');
    }

    // 4. Urgency compatibility (+10)
    if (inputs.requestUrgency === 'URGENT') {
      score += 10;
      reasons.push('Priority immediate responder profile');
    } else if (inputs.requestUrgency === 'TODAY') {
      score += 10;
      reasons.push('Same-day dispatch readiness');
    } else {
      score += 8;
      reasons.push('Open window matching');
    }

    // 5. Proximity bonus (+5)
    if (actualDistanceKm !== null && actualDistanceKm <= 3.0) {
      score += 5;
      reasons.push('Within quick response radius');
    } else if (actualDistanceKm === null) {
      score += 5;
      reasons.push('Local neighborhood matching');
    }

    // Cap at 100
    const finalScore = Math.min(Math.max(score, 40), 98);

    return {
      score: finalScore,
      reasons,
    };
  }
}
