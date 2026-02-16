# Verified Data Audit (Feb 2026)

Last updated: 2026-02-15
Scope: GTA Online economy/event values used by this app.

## Source policy

- **High confidence**: Rockstar Newswire (time-bound weekly events and active bonuses).
- **Medium confidence**: GTA Wiki/Fandom raw pages (static costs, upgrade tables, property ranges).
- Weekly events are volatile; static values should still be periodically re-checked after title updates.

## Verified source links

### Official (Rockstar)

- [Rockstar Newswire — Feb 5, 2026](https://www.rockstargames.com/newswire/article/k4a5388838a121/break-up-rival-couples-in-the-new-deadline-duet-mode-for-triple-reward)
- [Rockstar Newswire — Feb 12, 2026](https://www.rockstargames.com/newswire/article/4k1255o1295k32/cozy-up-in-the-new-grotti-itali-classic)
- [Rockstar Newswire GTA Online tag index](https://www.rockstargames.com/newswire?tag_id=702)

### Static data references (wiki raw)

- [Acid Lab (raw)](https://gta.fandom.com/wiki/Acid_Lab?action=raw)
- [Disruption Logistics (raw)](https://gta.fandom.com/wiki/Disruption_Logistics?action=raw)
- [The Open Road (raw)](https://gta.fandom.com/wiki/The_Open_Road?action=raw)
- [Kosatka (raw)](https://gta.fandom.com/wiki/Kosatka?action=raw)
- [Agencies (raw)](https://gta.fandom.com/wiki/Agencies?action=raw)
- [Nightclubs (raw)](https://gta.fandom.com/wiki/Nightclubs?action=raw)
- [Bunkers (raw)](https://gta.fandom.com/wiki/Bunkers?action=raw)
- [Auto Shops (raw)](https://gta.fandom.com/wiki/Auto_Shops?action=raw)

## Trust matrix (repo vs verified)

| Domain | App value | Verified value | Status | Notes |
| --- | ---: | ---: | --- | --- |
| Acid Lab equipment upgrade | 250,000 | 250,000 | ✅ Match | Infra/model configs aligned |
| Bunker equipment upgrade | 1,155,000 | 1,155,000 | ✅ Match | Aligned |
| Bunker staff upgrade | 598,500 | 598,500 | ✅ Match | Aligned |
| Bunker security upgrade | 351,000 | 351,000 | ✅ Match | Aligned |
| MC Coke equip/staff | 935,000 / 390,000 | 935,000 / 390,000 | ✅ Match | Aligned |
| MC Meth equip/staff | 1,100,000 / 331,500 | 1,100,000 / 331,500 | ✅ Match | Aligned |
| MC Cash equip/staff | 880,000 / 273,000 | 880,000 / 273,000 | ✅ Match | Aligned |
| MC Weed equip/staff | 990,000 / 273,000 | 990,000 / 273,000 | ✅ Match | Aligned |
| MC Documents equipment | 660,000 | 550,000 | ❌ Drift | Patched in this audit pass |
| Agency location ordering/cost hints | Partially stale | Little Seoul 2.01M, Vespucci 2.145M, Rockford 2.415M, Hawick 2.83M | ❌ Drift | Patched guidance text |
| Auto Shop location hints | Partially stale | Mission Row 1.67M, Strawberry 1.705M, Rancho 1.75M, Burton 1.83M, La Mesa 1.92M | ❌ Drift | Patched guidance text |
| Weekly bonuses Feb 2026 | Mostly aligned | Rockstar-confirmed Feb 5 + Feb 12 windows | ✅ Match | Continue weekly refresh |

## Important caveats

- Property pages often show both **base purchase prices** and **fully configured totals**; these are not contradictions.
- Weekly boosts/discounts are ephemeral and should not be hard-coded as static economics.
- Some app values are design heuristics (e.g., net-worth proxy values) and may intentionally differ from literal purchase math.

## Recommended cadence

- Refresh weekly events every Thursday after Rockstar publishes Newswire.
- Re-run static-cost audit monthly or after major GTA Online title updates.
