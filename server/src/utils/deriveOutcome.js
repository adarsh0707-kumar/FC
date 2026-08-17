/**
 * Derives W/D/L from the club's perspective, given the fixture's home/away
 * status and the final score. homeScore/awayScore are always literal
 * home-team/away-team goals, regardless of which side is "us".
 */
export function deriveOutcome(homeScore, awayScore, homeAway) {
  const clubScore = homeAway === "HOME" ? homeScore : awayScore;
  const oppScore = homeAway === "HOME" ? awayScore : homeScore;

  if (clubScore > oppScore) return "W";
  if (clubScore < oppScore) return "L";
  return "D";
}
