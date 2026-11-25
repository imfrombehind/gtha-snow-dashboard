# GTHA Winter Maintenance Levels of Service: Normalized Dataset (30 Jurisdictions, verified November 12, 2026)

*Revised November 23, 2026: QC fix for source conflicts (see Revision Log).*

Only Toronto publishes a complete, council-approved winter LOS matrix covering trigger, maximum operating time and target surface for every asset class. The other 29 jurisdictions publish partial data, and three (Halton Region, Uxbridge, Brock) have no usable numeric standard on any page I could verify. Treat this dataset as a comparison of what each jurisdiction has published, not as a like-for-like performance benchmark.

## Revision Log (November 23, 2026)
- Disputed values now show both figures and their sources ("Sources differ: …") in the affected cell only. Undisputed values in the same row are no longer withheld.
- Newly marked: Burlington sidewalks (48 vs 72 hrs), King local roads (previously "12–16 hrs (conflict)"), and Vaughan local roads (12 hrs vs 16 hrs for all roads).
- Aurora windrows: not a conflict. The program page and the Town's 2026–27 announcement agree (≥ 8 cm, after all Town roads are cleared, done within 12 hrs of service start, $200/season).\[65\]\[66\] Flag removed.
- Mississauga collectors: the 2 cm figure moved from the salting column to the plowing column, where the dispute is; salting restored to "Salted only below 5 cm".
- "Conflict" wording removed from notes; the cell value itself now carries the marker.

## TL;DR
- **Toronto has the most complete and most aggressive published standard.** Plowing starts at 2.5 cm on expressways, 5 cm on arterials and 8 cm on collectors and locals, with maximum operating times of 2, 6, 8 and 14 hrs. Sidewalks, cycling infrastructure, bus stops and pedestrian crossovers all trigger at 2 cm. Most suburban municipalities instead promise to clear all roads within 16–24 hrs after snowfall ends, with residential plowing triggered at 5–10 cm.
- **Peel is the only upper-tier Region with a numeric regional-road standard.** At ≥2.5 cm, Regional roads are brought back to ≤2.5 cm within 4 hrs at bare pavement, and bike lanes within 8 hrs.\[1\] York and Durham describe 24/7 operations\[2\] but publish no cm or hour targets.\[2\]\[3\] Halton Region's LOS sits in standards "currently under review", and in Halton Hills the Town itself clears the Regional roads.
- **Driveway windrows are the biggest service split.** Toronto (eligible streets), Mississauga, Vaughan and Richmond Hill clear windrows as a universal service, and Oakville runs a paid program.\[4\] Most others offer only a seniors/disability program; Brampton, Pickering, Hamilton, Caledon, Scugog and East Gwillimbury leave windrows to residents.\[5\]

## Key Findings
1. **Toronto's matrix is the benchmark.** It gives initiation level, maximum operating time and required outcome for brine, salting, plowing, sidewalks, cycling, bus stops/pedestrian crossovers and windrows.\[6\] However, Municipal VU Consulting Inc.'s 2025 Winter Storm Response and Winter Maintenance Program Review for the City (Executive Committee item EX25.5, July 16, 2025) states: "At present, there are no Council-approved service levels for significant weather events."
2. **Three different clocks are in use.** Mississauga, Brampton, Oakville, Milton, Halton Hills, Vaughan, Richmond Hill, Newmarket, Whitchurch-Stouffville, Hamilton and Oshawa start the clock when snowfall ends.\[4\]\[7\]\[8\]\[9\]\[10\]\[11\]\[12\]\[13\]\[14\]\[15\]\[16\]\[17\] Scugog starts it when snow reaches the trigger depth, which is the MMS-style approach.\[18\] Toronto publishes a maximum operating time per round.\[6\] Do not compare these hours without a clock-basis filter.
3. **Explicit MMS (O. Reg. 239/02) citations are rare.** Milton, Halton Hills, Caledon and Oshawa cite it, and Newmarket references "(239)".\[8\]\[15\]\[19\]\[20\]\[21\] Peel, Georgina and Whitby reproduce MMS class/depth/time tables, and Scugog uses matching depths and times.\[1\]\[18\]\[22\]\[23\]\[24\] King and Markham reference provincial standards without giving the regulation number.\[25\]\[26\]
4. **Sidewalk responsibility splits roughly in half.** Toronto, Mississauga, Burlington, Vaughan, Richmond Hill, Aurora, Newmarket, Whitchurch-Stouffville (urban areas), East Gwillimbury and King clear sidewalks citywide.\[4\]\[6\]\[9\]\[25\]\[27\]\[28\]\[29\]\[30\]\[31\]\[32\]\[33\] Hamilton, Brampton, Milton, Pickering, Ajax, Whitby, Oshawa, Clarington and Scugog rely on resident by-laws (24 hrs or a fixed deadline) plus partial municipal routes.\[15\]\[18\]\[21\]\[34\]\[35\]\[36\]\[37\]\[38\]\[39\]
5. **Significant Weather Event (SWE) declarations suspend or extend timelines.** This applies in Mississauga, Brampton (24 → 48 hrs), Oakville, Milton and Hamilton.\[4\]\[14\]\[15\]\[16\]\[40\]\[41\] Peel says its service levels "do not change, but… may take longer."\[42\]

## Legend and Data Rules
- **NS** = "Not specified on website" (find/replace on export). **NF** = official page not found/verified.
- **Directory** in Source_URL = the municipality's Official Winter Page URL in the Source_Directory tab (restore with XLOOKUP on Municipality). A full URL is given wherever a different official page was used.
- Expressway rows exist only for Toronto and Hamilton; other jurisdictions have no municipal expressways (400-series highways are maintained by MTO). Upper-tier Regions carry rows only for the categories they own or address.
- **Sources differ: A (source), B (source)** = two official or public sources give different values for this cell. Not resolved; shown as-is. Only the disputed cell carries this marker; other cells in the row are undisputed.
- **[2°]** = figure from a secondary source (news, directory or a peer municipality's report) because the official page could not be fully retrieved. Verify before publishing.

## Tab 1: LOS_Comparison_Data

| Region | Municipality | Standardized_Asset_Category | Municipal_Terminology | Salting_Anti_Icing_Trigger | Plowing_Trigger_cm | Completion_Timeline_Hours | Target_Surface_Condition | Ontario_MMS_Class_Referenced | Key_Notes_&_Exceptions | Source_URL |
|---|---|---|---|---|---|---|---|---|---|---|
| Single-Tier | City of Toronto | Expressway | Expressways (DVP & Gardiner) | Brine "as required"; salting "when snow first accumulates" (< 2.5 cm) | 2.5 cm | Salting 2 hrs; plowing 2 hrs max operating time per round | Bare Pavement | No | Multiple rounds may be needed; brine max 6 hrs | Directory |
| Single-Tier | City of Toronto | Arterial / Major Road | Arterials / "Major roads, transit routes and streets with hills" | Brine as required; salting when snow first accumulates (< 5 cm) | 5 cm | Salting 4 hrs; plowing: Sources differ: 6 hrs (LOS table), 6–8 hrs (summary table) | Bare Pavement | No | Max operating time per round | Directory |
| Single-Tier | City of Toronto | Collector Road | Collector | Brine as required; salting < 8 cm | 8 cm | Salting 4 hrs; plowing 8 hrs | Centre Bare | No | Centre bare = 2.5 m cleared at centre | Directory |
| Single-Tier | City of Toronto | Local / Residential Road | Local Roads / Residential streets; Laneways | Salting < 8 cm | 8 cm | Salting 8 hrs; plowing 14 hrs; laneways 24 hrs from end of snowfall | Safe & Passable / Snow Packed | No | Laneways are the only explicit end-of-snowfall clock | Directory |
| Single-Tier | City of Toronto | Sidewalks | Sidewalks (combined salting & plowing) | 2 cm | 2 cm | 12 hrs | Safe & Passable / Snow Packed | No | City mechanically clears all sidewalks | Directory |
| Single-Tier | City of Toronto | Cycling Infrastructure / Multi-Use Trails | All Cycling Infrastructure | 2 cm | 2 cm | 8 hrs | Safe & Passable / Bare Pavement | No | 2024 revision aligned on-road bike lanes with cycle tracks/MUPs\[43\] | Directory |
| Single-Tier | City of Toronto | Driveway Windrows | Driveway Windrow Openings | N/A | Follows plow; collector/arterial only if windrow > 25 cm | "Same as adjacent roadway plus 2 hours" | Safe & Passable / Snow Packed | No | Municipal service on eligible streets; 3 m opening | Directory |
| Single-Tier | City of Toronto | Bus Stops & Pedestrian Crossovers | Bus Stops & Pedestrian Crossovers | 2 cm | 2 cm | 12 hrs | Safe & Passable / Snow Packed | No | Hand crews "same as work area" | Directory |
| Single-Tier | City of Hamilton | Expressway | Parkways (Linc, Red Hill Valley Pkwy) | Pre-treated with Priority 1/2 roads (SWE releases) | NS | NS | NS | No | MTO maintains provincial highways | Directory |
| Single-Tier | City of Hamilton | Arterial / Major Road | Priority 1: Major arterial roads & escarpment accesses | Pre-treatment | 2.5–5 cm [2°] | 4 hrs; clock starts after winter event ends | Bare Pavement | No | Council LOS: Appendix "B" to Report PW18096(a) | Directory |
| Single-Tier | City of Hamilton | Collector Road | Priority 2: Collector roads (2A = transit) | Pre-treatment | > 8 cm [2°] | < 8 hrs [2°] | Bare Pavement [2°] | No | Full table not retrieved | Directory |
| Single-Tier | City of Hamilton | Local / Residential Road | Priority 3: Neighbourhood streets | NS | NS | NS | NS | No | Rural loose-top Class 6 = 10 cm, 24-hr response (Appendix B) | Directory |
| Single-Tier | City of Hamilton | Sidewalks | Priority 1 & 2A transit-route sidewalks | Activated on forecast | NS | 24 hrs after end of event or declared SWE | NS | No | City clears 885 km; residents clear others within 24 hrs (By-law 03-296) | https://www.hamilton.ca/home-neighbourhood/getting-around/streets-sidewalks/sidewalk-snow-clearing |
| Single-Tier | City of Hamilton | Cycling Infrastructure / Multi-Use Trails | Bicycle lanes (Report PW10096a) | NS | NS | NS | NS | No | Figures not retrieved | Directory |
| Single-Tier | City of Hamilton | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | No | No program found | Directory |
| Single-Tier | City of Hamilton | Bus Stops & Pedestrian Crossovers | Transit stops | Activated on forecast | NS | 24 hrs after end of event | NS | No | Added 2022 | https://www.hamilton.ca/home-neighbourhood/getting-around/streets-sidewalks/sidewalk-snow-clearing |
| Halton | Region of Halton | Arterial / Major Road | Regional Roads | NS | NS | NS | NS | No | LOS in "Performance and Maintenance Standards… currently under review"; Halton Hills clears Regional roads in its boundary | Directory |
| Halton | Region of Halton | Sidewalks | — | NS | NS | NS | NS | No | — | Directory |
| Halton | Region of Halton | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| Halton | Region of Halton | Driveway Windrows | — | N/A | N/A | N/A | NS | No | — | Directory |
| Halton | Burlington | Arterial / Major Road | Primary roads | Brine pre-storm; salted at 1–4 cm | 5 cm | All roads within 24 hrs after snow stops (Snow Removal Plan) | NS | No | Snow Event (parking ban) at 7.5 cm; Regional roads not addressed | Directory |
| Halton | Burlington | Collector Road | Secondary roads | Salted at 1–4 cm | 5 cm | Within 24 hrs after snow stops (Snow Removal Plan) | NS | No | — | Directory |
| Halton | Burlington | Local / Residential Road | Residential roads | Sanded at intersections, hills, curves | 7.5 cm, after primary/secondary | Within 24 hrs after snow stops (Snow Removal Plan) | Safe & Passable / Snow Packed | No | "not maintained to bare pavement" | Directory |
| Halton | Burlington | Sidewalks | All sidewalks (~850 km) | Salted/sanded as required | 5 cm | Sources differ: 48 hrs after end of snowfall (stated aim), up to 72 hrs after snowfall ends (plowed after all roads) — both on Snow Removal Plan page | NS | No | 72 hrs also stated for high-volume off-road pathways | Directory |
| Halton | Burlington | Cycling Infrastructure / Multi-Use Trails | Multi-use pathways | NS | 5 cm | Up to 72 hrs | NS | No | — | Directory |
| Halton | Burlington | Driveway Windrows | Windrow removal (registered) | N/A | NS | After road plowing | NS | No | Eligibility not verified | Directory |
| Halton | Burlington | Bus Stops & Pedestrian Crossovers | Transit stops | NS | 5 cm | Up to 72 hrs | NS | No | — | Directory |
| Halton | Oakville | Arterial / Major Road | First Priority: Primary roads | When snow first accumulates [2°] | 2.5 cm (Global News) | Up to 6 hrs after snow stops (Town, via Oakville News); all streets 24 hrs after snowfall ends (official) | NS | No | SWE suspends standard timelines | https://www.oakville.ca/town-hall/news-notices/snow-clearing-updates/snow-clearing-update-january-25-2026/ |
| Halton | Oakville | Collector Road | Second Priority: Secondary roads incl. bus routes | When snow first accumulates [2°] | 5 cm [2°] | Up to 12 hrs [2°] | NS | No | — | https://www.oakville.ca/town-hall/news-notices/snow-clearing-updates/snow-clearing-update-january-25-2026/ |
| Halton | Oakville | Local / Residential Road | Third Priority: Residential roads | NS | > 7.5 cm | 24 hrs after snowfall ends | NS | No | — | Directory |
| Halton | Oakville | Sidewalks | Primary/secondary and residential sidewalks | When "deemed slippery" [2°] | 5 cm main / 8 cm residential [2°] | ~24 hrs main; ~48 hrs residential [2°] | NS | No | After roads; school sidewalks first | https://www.oakville.ca/town-hall/news-notices/snow-clearing-updates/snow-clearing-update-january-25-2026/ |
| Halton | Oakville | Cycling Infrastructure / Multi-Use Trails | Speers Road bike lane | NS | NS | NS | NS | No | Listed as active operation | https://www.oakville.ca/town-hall/news-notices/snow-clearing-updates/snow-clearing-update-january-25-2026/ |
| Halton | Oakville | Driveway Windrows | Driveway Windrow Snow Clearing (paid) | N/A | > 7.5 cm, after all roads | Up to 36 hrs after snowfall ends | NS | No | Dec 1 2026–Mar 31 2027; once per event; priority registration 65+/disability\[44\] | Directory |
| Halton | Oakville | Bus Stops & Pedestrian Crossovers | Transit stops | NS | > 5 cm [2°] | ~48 hrs [2°] | NS | No | — | https://www.oakville.ca/town-hall/news-notices/snow-clearing-updates/snow-clearing-update-january-25-2026/ |
| Halton | Milton | Arterial / Major Road | Priority 1: Major roads and transit routes | Salt or sand | NS (2 cm per directory listing [2°]) | All roads 24 hrs after end of snowfall | Bare Pavement | Yes (O. Reg. 239/02) | SWE may extend\[15\] | Directory |
| Halton | Milton | Collector Road | Priority 2: Rural collector roads and industrial areas | Salt or sand\[15\] | NS | 24 hrs | Bare Pavement | Yes | — | Directory |
| Halton | Milton | Local / Residential Road | Priority 3: Urban and rural residential roads | As needed\[15\] | NS (10 cm per directory listing [2°]) | 24 hrs | NS | Yes | — | Directory |
| Halton | Milton | Sidewalks | Sidewalks for schools, transit, major pedestrian routes | NS | 5 cm | NS | NS | Yes | Residents clear own sidewalks within 24 hrs\[15\] | Directory |
| Halton | Milton | Cycling Infrastructure / Multi-Use Trails | Pathways | NS | 5 cm | NS | NS | Yes | — | Directory |
| Halton | Milton | Driveway Windrows | Windrow removal program | N/A | NS | NS | Resident Responsibility | Yes | Program for seniors/persons with disabilities\[15\] | Directory |
| Halton | Milton | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |
| Halton | Halton Hills | Arterial / Major Road | Priority 1: Main roads (incl. Regional roads) | At first sign of snow/ice | "When accumulations warrant" | All streets 24 hrs after end of storm | Bare Pavement | Yes (O. Reg. 239/02) | Town clears Regional roads in Halton Hills | Directory |
| Halton | Halton Hills | Collector Road | Priority 2: Collector roads | After main roads | NS | 24 hrs | Bare Pavement | Yes | — | Directory |
| Halton | Halton Hills | Local / Residential Road | Priority 3: Residential and rural roads | Sanded as required | NS | 24 hrs | Safe & Passable / Snow Packed | Yes | Snow-packed locals deemed acceptable | Directory |
| Halton | Halton Hills | Sidewalks | Designated sidewalks (~160 km) | NS | NS | Town aim: plowing complete within 24–48 hrs after end of storm | NS | Yes | Designated under By-law No. 2007-0003: roads > 1,000 vehicles/day and school frontages | Directory |
| Halton | Halton Hills | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | Yes | — | Directory |
| Halton | Halton Hills | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | Yes | Seniors service discussed in TPW-2023-023 only | Directory |
| Halton | Halton Hills | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |
| Peel | Region of Peel | Arterial / Major Road | Regional Roads (MMS Class 1–5) | Salters at start of storm; anti-icing | ≥ 2.5 cm | Back to ≤ 2.5 cm within 4 hrs after accumulation ends | Bare Pavement | Yes | SWE: levels unchanged but slower\[1\]\[42\]\[45\]\[46\] | Directory |
| Peel | Region of Peel | Sidewalks | Sidewalks | NS | ≥ 8 cm | Reduce to ≤ 8 cm within 48 hrs\[1\] | NS | Yes | Local municipalities clear most sidewalks | Directory |
| Peel | Region of Peel | Cycling Infrastructure / Multi-Use Trails | Roadway designated bicycle lane | NS | ≥ 2.5 cm | Back to ≤ 2.5 cm within 8 hrs\[1\] | NS | Yes | — | Directory |
| Peel | Region of Peel | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | No | Region "tries to minimize" snow in driveways\[45\] | https://peelregion.ca/transportation-roads/road-maintenance/winter-operations/snow-removal |
| Peel | Mississauga | Arterial / Major Road | Major and priority roads | Starts when snow starts; < 5 cm salted only | 5 cm | < 5 cm salted 12 hrs; 5–15 cm 12 hrs; 15–30 cm 24 hrs (after snowfall ends) | NS | No | SWE puts timelines on hold; renewed heavy snow restarts process;\[4\] Regional roads by Peel | Directory |
| Peel | Mississauga | Collector Road | Priority roads (collectors) | Salted only below 5 cm | Sources differ: 5 cm (current page), 2 cm for select collectors (older text) | As priority roads | NS | No | Older text gave 5 cm for local collectors | Directory |
| Peel | Mississauga | Local / Residential Road | Residential (secondary) roads | < 5 cm salted 24 hrs | 5 cm | 5–15 cm 24 hrs; 15–30 cm 36 hrs; > 30 cm > 36 hrs | NS | No | Some residential streets are priority | Directory |
| Peel | Mississauga | Sidewalks | Priority sidewalks; residential sidewalks | Salted < 5 cm | 5 cm | Priority 12–24 hrs; residential 24–36 hrs | NS | No | City clears all sidewalks\[4\] | Directory |
| Peel | Mississauga | Cycling Infrastructure / Multi-Use Trails | Trails, bike lanes | Salted < 5 cm | 5 cm | NS | NS | No | Old maps say > 8 cm (outdated) | Directory |
| Peel | Mississauga | Driveway Windrows | Driveway windrow clearing (standard service) | N/A | 5 cm | After final plowing: 4 hrs (5–15 cm); 6 hrs (15–30 cm) | NS | No | Universal; skipped if blocked\[4\] | Directory |
| Peel | Mississauga | Bus Stops & Pedestrian Crossovers | Bus stops, crossings | Salted < 5 cm | 5 cm | 12–24 hrs | NS | No | — | Directory |
| Peel | Brampton | Arterial / Major Road | Arterial roads | Salted when snowfall begins | Plowed continuously | All roads 24 hrs after end of snowfall; 48 hrs after SWE | Bare Pavement | No | Regional roads by Peel | Directory |
| Peel | Brampton | Collector Road | Collector roads | During accumulation | During accumulation | 24 / 48 hrs | Centre Bare (bare to track bare) | No | — | Directory |
| Peel | Brampton | Local / Residential Road | Local roads and courts | Salt applied | 5 cm (single event) | 24 / 48 hrs | Safe & Passable / Snow Packed | No | — | Directory |
| Peel | Brampton | Sidewalks | Primary-road, transit-route, City-property sidewalks | NS | NS | ~24 hrs | NS | No | Residents clear by 11 am next day | https://www.brampton.ca/EN/residents/Roads-and-Traffic/Maintenance-Programs/Snow-Clearing-Operations/pages/resident-guide.aspx |
| Peel | Brampton | Cycling Infrastructure / Multi-Use Trails | Recreational trails | NS | NS | NS | NS | No | — | https://www.brampton.ca/EN/residents/Roads-and-Traffic/Maintenance-Programs/Snow-Clearing-Operations/pages/resident-guide.aspx |
| Peel | Brampton | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | No | No program for 2025/26\[16\] | Directory |
| Peel | Brampton | Bus Stops & Pedestrian Crossovers | Bus stops | NS | NS | NS | NS | No | — | https://www.brampton.ca/EN/residents/Roads-and-Traffic/Maintenance-Programs/Snow-Clearing-Operations/pages/resident-guide.aspx |
| Peel | Caledon | Arterial / Major Road | Regional roads | — | — | — | — | Yes (O. Reg. 239/02) | Maintained by Region\[22\] (see Peel)\[20\] | Directory |
| Peel | Caledon | Collector Road | Town-owned roads | Sanding, de-icing | NS | ~24 hrs following winter events\[20\] | NS | Yes | — | Directory |
| Peel | Caledon | Local / Residential Road | Town-owned residential roads | Sanding, de-icing | NS | ~24 hrs | NS | Yes | 1,700+ km | Directory |
| Peel | Caledon | Sidewalks | Sidewalk routes | NS | NS | 48 hrs after significant event | NS | Yes | — | Directory |
| Peel | Caledon | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | Yes | — | Directory |
| Peel | Caledon | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | Yes | — | Directory |
| Peel | Caledon | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |
| Durham | Region of Durham | Arterial / Major Road | Regional Roads | Anti-icing brine pre-storm; salt on snow/freezing rain\[3\] | NS | NS | NS | No | Patrolled 7 days/week; no numeric LOS\[47\] | Directory |
| Durham | Region of Durham | Sidewalks | — | NS | NS | NS | NS | No | Local municipalities clear | Directory |
| Durham | Region of Durham | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| Durham | Region of Durham | Driveway Windrows | — | N/A | N/A | N/A | NS | No | — | Directory |
| Durham | Pickering | Arterial / Major Road | Regional roads | — | — | — | — | No | Maintained by Region | Directory |
| Durham | Pickering | Collector Road | Priority Routes: Collector (Main) roads & bus routes | NaCl pre-applied if snow within 48 hrs; salt once snow "sticks" | ~5 cm | Urban 13 hrs (≤ 4") / 24 hrs (≤ 8"); rural 20 / 30 hrs | NS | No | 13 urban + 2 rural routes\[37\]\[48\] | Directory |
| Durham | Pickering | Local / Residential Road | Local roads; rural gravel roads | Salt (paved) / sand (gravel)\[5\] | ~5 cm | Within above windows | NS | No | Some Seaton roads by developer\[5\] | Directory |
| Durham | Pickering | Sidewalks | Main / Secondary / Hand Route sidewalks | NS | After snow stops\[48\] | NS | NS | No | Residents clear within 24 hrs\[38\] (By-law 6650/06); City clears sidewalks on Regional roads\[37\] | https://www.pickering.ca/property-roads-safety/parking-roads-and-driveways/snow-removal-and-clearing/ |
| Durham | Pickering | Cycling Infrastructure / Multi-Use Trails | Pathways/Walkways | NS | NS | NS | NS | No | — | Directory |
| Durham | Pickering | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | No | "doesn't have the resources"\[5\] | https://www.pickering.ca/property-roads-safety/parking-roads-and-driveways/snow-removal-and-clearing/snow-safety-tips/ |
| Durham | Pickering | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| Durham | Ajax | Arterial / Major Road | Regional roads | — | — | — | — | No | Maintained by Region | Directory |
| Durham | Ajax | Collector Road | Primary; Secondary roads | NS | Primary cleared "while it is snowing"\[49\] | NS | NS | No | Curb-to-curb\[50\] | Directory |
| Durham | Ajax | Local / Residential Road | Residential streets | NS | NS | NS | NS | No | — | Directory |
| Durham | Ajax | Sidewalks | Town sidewalks (~150 km)\[49\] | NS | NS | NS | NS | No | Residents clear within 24 hrs | Directory |
| Durham | Ajax | Cycling Infrastructure / Multi-Use Trails | Trails (~37 km)\[49\] | NS | NS | NS | NS | No | — | Directory |
| Durham | Ajax | Driveway Windrows | Snow Removal Program for Seniors & Qualified Residents | N/A | > 5 cm | Starts 24 hrs after snow stops | NS | No | Otherwise resident; $360.70 full / $41.13 sidewalk+windrow (2026–27)\[51\] | https://ajax.ca/wp-content/uploads/2026/03/Senior-Snow-Application-Form-2026-2027.pdf |
| Durham | Ajax | Bus Stops & Pedestrian Crossovers | School crossings (53)\[49\] | NS | NS | NS | NS | No | — | Directory |
| Durham | Whitby | Arterial / Major Road | Class 1 (Regional Roads) | NS | 2.5 cm | 4 hrs\[24\] | NS | Yes (MMS table) | Maintained by Region | Directory |
| Durham | Whitby | Collector Road | Primary (Class 2) / Secondary (Class 3–4) | Salted while snowing (primary)\[22\] | 5 cm / 8 cm | 6 hrs / 12–16 hrs | NS | Yes | Clock basis not stated | Directory |
| Durham | Whitby | Local / Residential Road | Residential (Class 5–6) | NS | 10 cm | 24 hrs | NS | Yes | — | Directory |
| Durham | Whitby | Sidewalks | Town sidewalks | NS | NS | After primary & secondary roads | NS | Yes | Residents clear within 24 hrs; Town may bill\[34\] | https://www.whitby.ca/town-hall/by-laws/sidewalk-snow-clearing/ |
| Durham | Whitby | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | Yes | — | Directory |
| Durham | Whitby | Driveway Windrows | Snow and windrow clearing (seniors/disability) | N/A | 10 cm windrow; 5 cm sidewalk | Begins ~36 hrs after snow stops | NS | Yes | Free; no able-bodied person under 65 | https://www.whitby.ca/services-and-payments/parking-roads-and-transportation/snow-and-windrow-clearing-services/ |
| Durham | Whitby | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |
| Durham | Oshawa | Arterial / Major Road | Arterial (primary) | NS | NS | 6 hrs | NS | Yes (O. Reg. 239/02)\[21\] | Region maintains Regional roads\[24\] | Directory |
| Durham | Oshawa | Collector Road | Collector (primary) | NS | NS | 12 hrs | NS | Yes | Transit/emergency routes, schools\[21\] | Directory |
| Durham | Oshawa | Local / Residential Road | Residential (secondary) | NS | NS (8 cm per asset plan [2°]) | 16 hrs\[21\]\[24\] | NS | Yes | — | Directory |
| Durham | Oshawa | Sidewalks | City sidewalks per service map | NS | NS | NS | NS | Yes | Owners clear by midnight next day\[21\] | Directory |
| Durham | Oshawa | Cycling Infrastructure / Multi-Use Trails | Trails & walkways | NS | NS | NS | NS | Yes | — | Directory |
| Durham | Oshawa | Driveway Windrows | Snow Clearing Assistance Program | N/A | > 2.5 cm; windrow ≥ 20 cm | By midnight the day after snowfall ends\[52\] | NS | Yes | Registered residents only | https://www.oshawa.ca/media/41qb4tsj/snow-clearing-help-info-bulletin-2025-2026.pdf |
| Durham | Oshawa | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |
| Durham | Clarington | Arterial / Major Road | Main roads and emergency routes | NS | NS | NS | NS | No | Cleared first; Regional roads by Durham\[53\] | Directory |
| Durham | Clarington | Collector Road | Primary routes | NS | NS | NS | NS | No | — | Directory |
| Durham | Clarington | Local / Residential Road | Residential streets | NS | NS | After snow stops or primaries under control\[53\] | NS | No | — | Directory |
| Durham | Clarington | Sidewalks | Municipal sidewalk program (primary routes) | Plow and salt | NS | NS | NS | No | Since 2023-24; residents clear others within 24 hrs\[39\] | https://www.clarington.net/snowremoval/ |
| Durham | Clarington | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| Durham | Clarington | Driveway Windrows | Snow Clearing Program for Seniors and Persons with Disabilities | N/A | NS | NS | NS | No | Bundled sidewalk + windrow, set fee\[39\] | https://www.clarington.net/snowremoval/ |
| Durham | Clarington | Bus Stops & Pedestrian Crossovers | Pedestrian crossovers, school crossings | Plow and salt\[39\] | NS | NS | NS | No | — | https://www.clarington.net/snowremoval/ |
| Durham | Uxbridge | All 8 categories | NF | NF | NF | NF | NF | NF | DATA GAP: official page not verified | NF |
| Durham | Scugog | Arterial / Major Road | Priority 1: Arterial Roads and EMS Locations | NS | 8 cm | 12 hrs from when snow reaches 8 cm | NS | No (MMS-style values) | Clock starts at trigger depth | Directory |
| Durham | Scugog | Collector Road | Priority 2: Class 4, Collector Roads & Bus Routes | NS | 8 cm | 16 hrs from 8 cm | NS | No | — | Directory |
| Durham | Scugog | Local / Residential Road | Priority 3: Class 5 & 6 and Local Roads | NS | 10 cm | 24 hrs from 10 cm | NS | No | Full operation 8–12 hrs | Directory |
| Durham | Scugog | Sidewalks | Select Township sidewalks | NS | NS | At least once within 24 hrs | NS | No | Owners clear within 24 hrs | Directory |
| Durham | Scugog | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| Durham | Scugog | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | No | No program found | Directory |
| Durham | Scugog | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| Durham | Brock | All 8 categories | NF | NF | NF | NF | NF | NF | DATA GAP: official page not verified | NF |
| York | Region of York | Arterial / Major Road | Regional Roads (4,400+ lane-km; 133 vehicles incl. 126 combination plow trucks and 7 brine trucks) | Brine pre-storm; salt/sand cycle ~90 min | NS | One plow cycle ~120 min (not a completion standard) | NS | No (council report: levels "driven by compliance with minimum maintenance standards")\[54\] | 24/7 operations | Directory |
| York | Region of York | Sidewalks | Sidewalks adjacent to Regional roads | — | — | — | — | No | Lower-tier responsibility\[54\] | Directory |
| York | Region of York | Cycling Infrastructure / Multi-Use Trails | Regional bike lanes, MUPs | NS | NS | NS | NS | No | 160+ km bike lanes, 15 km MUPs cleared Jan 2026\[55\] | https://www.york.ca/newsroom/news/york-region-responds-back-back-winter-storms-keeping-roads-safe |
| York | Region of York | Driveway Windrows | — | N/A | N/A | N/A | NS | No | Refers to local programs\[2\] | Directory |
| York | Vaughan | Arterial / Major Road | Regional roads | — | — | — | — | No | Maintained by York Region | Directory |
| York | Vaughan | Collector Road | Main roads | NS | 5 cm | Sources differ: 4 hrs after snowfall ends (snow removal page), 16 hrs for all roads (City news releases) | NS | No | — | Directory |
| York | Vaughan | Local / Residential Road | Residential roads | NS | 5 cm | Sources differ: 12 hrs after snowfall ends (snow removal page), 16 hrs for all roads (City news releases) | NS | No | — | Directory |
| York | Vaughan | Sidewalks | Main road / residential sidewalks | NS | 5 cm | NS | NS | No | City clears both | Directory |
| York | Vaughan | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| York | Vaughan | Driveway Windrows | Windrow-clearing service | N/A | Follows plow | Up to 4 hrs after plow passes\[56\] | NS | No | Universal service | Directory |
| York | Vaughan | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| York | Markham | Arterial / Major Road | Arterial roads | — | — | — | — | Partial (meets/exceeds Provincial standards) | Mostly York Region | Directory |
| York | Markham | Collector Road | Primary / Secondary roads | Brine on primary roads/bridges; salt trucks first | 5 cm | ~14 hrs (plowing and sanding) | NS | Partial | Mapping of 5 cm/14 hrs to class inferred | Directory |
| York | Markham | Local / Residential Road | Local / residential roads | NS | 7.5 cm, after storm ends | ~16 hrs | NS | Partial | — | Directory |
| York | Markham | Sidewalks | Sidewalks (arterial/primary first) | NS | 5 cm | NS | NS | Partial | City clears | Directory |
| York | Markham | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | Partial | — | Directory |
| York | Markham | Driveway Windrows | Snow Windrow Removal Assistance Program\[2\] | N/A | Follows plow | Within 4 hrs after road plowed\[57\] | NS | Partial | 60+ and disabled residents | Directory |
| York | Markham | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Partial | — | Directory |
| York | Richmond Hill | Arterial / Major Road | Regional roads | — | — | — | — | No | Maintained by York Region | Directory |
| York | Richmond Hill | Collector Road | Primary / Secondary roads | NS | 5 cm | 16 hrs after snow stops | NS | No | 10+ cm may trigger SWE | Directory |
| York | Richmond Hill | Local / Residential Road | Local roads; cul-de-sacs, dead ends | NS | 5 cm | 16 hrs; cul-de-sacs 24 hrs | NS | No | — | Directory |
| York | Richmond Hill | Sidewalks | Sidewalks (~750 km) | NS | 5 cm | 14 hrs after end of snowfall | NS | No | City clears all | Directory |
| York | Richmond Hill | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| York | Richmond Hill | Driveway Windrows | City-wide windrow clearing | N/A | 5 cm | 13 hrs | NS | No | Universal; excludes sidewalk-plow windrows\[58\] | Directory |
| York | Richmond Hill | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| York | King | Arterial / Major Road | Regional roads | — | — | — | — | Partial | Maintained by York Region | Directory |
| York | King | Collector Road | Major / Class 3–4 routes | Treated at 8 cm | 8 cm | Sources differ: 16 hrs after snowfall ends (Township page), 12 hrs (2025 flyer) | NS | Partial (MMS named) | — | Directory |
| York | King | Local / Residential Road | Class 5 / cul-de-sacs | 8 cm | 8 cm | Sources differ: 16 hrs after snowfall ends (Township page), 12 hrs (2025 flyer) | NS | Partial | Cul-de-sacs last | Directory |
| York | King | Sidewalks | Township sidewalks (contracted) | NS | NS | NS | NS | Partial | Resident duty not verified | Directory |
| York | King | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | Partial | — | Directory |
| York | King | Driveway Windrows | Senior Snow Removal Assistance Program | N/A | ≥ 10 cm | 24 hrs after road & sidewalk plowing (Mon–Fri)\[59\] | NS | Partial | 65+ households | https://www.king.ca/snowremoval |
| York | King | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Partial | — | Directory |
| York | Aurora | Arterial / Major Road | Yonge Street | NS | 5 cm | 6 hrs | Bare Pavement | No | Clock basis not stated | Directory |
| York | Aurora | Collector Road | Primary roads | NS | 8 cm | 16 hrs | Bare Pavement | No | — | Directory |
| York | Aurora | Local / Residential Road | Secondary roads | NS | 8 cm | 24 hrs | NS ("Select Treatment") | No | — | Directory |
| York | Aurora | Sidewalks | All Town sidewalks & walkways | NS | 5 cm | NS (24 hrs per news [2°]) | NS | No | Primary and school routes first | Directory |
| York | Aurora | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| York | Aurora | Driveway Windrows | Windrow Removal Pilot Program | N/A | ≥ 8 cm, after all Town roads are cleared | Within 12 hrs of service start\[60\]\[66\] | NS | No | $200/season fee; seniors and residents with disabilities; Dec 1, 2026–Apr 1, 2027; one-car-width opening\[65\]\[66\] | https://www.aurora.ca/town-services/roads-and-traffic/winter-maintenance/windrow-removal-pilot-program/ |
| York | Aurora | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| York | Whitchurch-Stouffville | Arterial / Major Road | Arterial roads | NS | 5 cm | ~8 hrs after end of storm (all classes) | NS | No | Regional arterials by York | Directory |
| York | Whitchurch-Stouffville | Collector Road | Collector roads | NS | 5 cm | ~8 hrs | NS | No | — | Directory |
| York | Whitchurch-Stouffville | Local / Residential Road | Local roads | NS | 5 cm | ~8 hrs | NS | No | — | Directory |
| York | Whitchurch-Stouffville | Sidewalks | All sidewalks (Stouffville, Ballantrae, Gormley) | Sanding | 5 cm | ~24 hrs after end of snowfall | NS | No | — | Directory |
| York | Whitchurch-Stouffville | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| York | Whitchurch-Stouffville | Driveway Windrows | Seniors & physically challenged windrow clearing | N/A | NS | ~12 hrs after road plowing [2°]\[61\] | NS | No | Free | https://www.townofws.ca/live/roads-parking-and-traffic/winter-roads/windrow-clearing/ |
| York | Whitchurch-Stouffville | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| York | Newmarket | Arterial / Major Road | Regional roads | — | — | — | — | Yes (cites "239") | Maintained by York Region | Directory |
| York | Newmarket | Collector Road | Higher-traffic & emergency routes | NS | > 6 cm | Up to 16 hrs (all roads) | NS | Yes | — | Directory |
| York | Newmarket | Local / Residential Road | Residential streets & courts | NS | > 6 cm | Up to 16 hrs | NS | Yes | Requests accepted 16 hrs after snow stops | Directory |
| York | Newmarket | Sidewalks | All Town sidewalks (364 km) | NS | NS | Up to 16 hrs | NS | Yes | — | Directory |
| York | Newmarket | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | Yes | — | Directory |
| York | Newmarket | Driveway Windrows | Residential Windrow Opening Pilot Program | N/A | > 6 cm | Up to 24 hrs | NS | Yes | First 100 eligible households\[62\] | Directory |
| York | Newmarket | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |
| York | East Gwillimbury | Arterial / Major Road | Regional roads | — | — | — | — | No | Maintained by York Region | Directory |
| York | East Gwillimbury | Collector Road | Primary roads | NS | 8 cm | NS | NS | No | — | Directory |
| York | East Gwillimbury | Local / Residential Road | Residential streets | NS | Sources differ: 8 cm (Town page), 10 cm (older guide) | NS | NS | No | — | Directory |
| York | East Gwillimbury | Sidewalks | All Town sidewalks | NS | 2.5 cm | Usually 24 hrs after storm\[31\] | NS | No | — | Directory |
| York | East Gwillimbury | Cycling Infrastructure / Multi-Use Trails | — | NS | NS | NS | NS | No | — | Directory |
| York | East Gwillimbury | Driveway Windrows | — | N/A | N/A | N/A | Resident Responsibility | No | Financial assistance pilot only | Directory |
| York | East Gwillimbury | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | No | — | Directory |
| York | Georgina | Arterial / Major Road | Class 1–2 (MMS table) | NS | Dispatch > 5 cm; Cl. 1 2.5 cm / Cl. 2 5 cm | Roads "within six hours following an event"; Cl. 1 4 hrs / Cl. 2 6 hrs | NS | Yes (MMS table) | Guide dated 2022 | Directory |
| York | Georgina | Collector Road | Class 3 / secondary | NS | 8 cm (3–8 cm per map) | 12 hrs | NS | Yes | — | Directory |
| York | Georgina | Local / Residential Road | Class 4–5 | NS | 8–10 cm | 16–24 hrs | NS | Yes | — | Directory |
| York | Georgina | Sidewalks | Sidewalks & paths (~140 km) | NS | 3–5 cm | 24 hrs (48 hrs if 10+ cm)\[63\] | NS | Yes | — | Directory |
| York | Georgina | Cycling Infrastructure / Multi-Use Trails | Paths | NS | 3–5 cm | 24 hrs | NS | Yes | With sidewalks | Directory |
| York | Georgina | Driveway Windrows | Windrow Snow Clearing Program\[2\] (PO-RD-W5) | N/A | ≥ 7.5 cm | 24 hrs after roads & sidewalks plowed\[64\] | NS | Yes | 65+ or disability | Directory |
| York | Georgina | Bus Stops & Pedestrian Crossovers | — | NS | NS | NS | NS | Yes | — | Directory |

## Tab 2: Source_Directory

| Municipality | Region | Official Winter Page URL | Last Verified Date | Summary of Responsibility Split |
|---|---|---|---|---|
| City of Toronto | Single-Tier | https://www.toronto.ca/services-payments/streets-parking-transportation/road-maintenance/winter-maintenance/levels-of-snow-clearing-service/ | November 12, 2026 | City: all roads incl. DVP/Gardiner, sidewalks, cycling, bus stops, windrows (eligible streets); MTO: 400-series |
| City of Hamilton | Single-Tier | https://www.hamilton.ca/home-neighbourhood/getting-around/streets-sidewalks/snow-clearing | November 12, 2026 | City: all roads incl. Linc/RHVP and 885 km of transit sidewalks; residents: other sidewalks within 24 hrs; MTO: provincial highways |
| Region of Halton | Halton | https://www.halton.ca/repository/salt-management-plan | November 12, 2026 | Region: Regional roads (LOS unpublished, under review); Halton Hills clears Regional roads in its boundary |
| Burlington | Halton | https://www.burlington.ca/en/roads-parking-and-traffic/snow-removal-plan.aspx | November 12, 2026 | City: local roads, all sidewalks/MUPs/stops; Region: Regional roads; registered windrow program |
| Oakville | Halton | https://www.oakville.ca/transportation-roads/roads-sidewalks/snow-clearing/driveway-windrow-snow-clearing/ | November 12, 2026 | Town: local roads, sidewalks, paid windrows; Region: Regional roads |
| Milton | Halton | https://www.milton.ca/en/living-in-milton/snow-removal.aspx | November 12, 2026 | Town: roads, priority sidewalks; residents: sidewalks (24 hrs) and windrows (seniors program)\[15\] |
| Halton Hills | Halton | https://www.haltonhills.ca/en/residents/winter-maintenance.aspx | November 12, 2026 | Town: Town and Regional roads, designated sidewalks; residents: windrows |
| Region of Peel | Peel | https://peelregion.ca/transportation-roads/road-maintenance/regular-road-servicing/road-service-maintenance-levels | November 12, 2026 | Region: Regional roads and bike lanes (2.5 cm/4 hrs, bare);\[1\]\[45\] lower tiers: local roads, most sidewalks |
| Mississauga | Peel | https://www.mississauga.ca/services-and-programs/transportation-and-streets/roads-and-sidewalks/snow-clearing/ | November 12, 2026 | City: roads, all sidewalks, trails, stops, bike lanes, windrows;\[4\] Peel: Regional roads |
| Brampton | Peel | https://www1.brampton.ca/EN/residents/Roads-and-Traffic/Maintenance-Programs/Snow-Clearing-Operations/Pages/Levels-of-Service.aspx | November 12, 2026 | City: roads, priority/transit sidewalks; residents: sidewalks (11 am next day), windrows; Peel: Regional roads |
| Caledon | Peel | https://www.caledon.ca/en/town-services/snow-removal.aspx | November 12, 2026 | Town: 1,700+ km local roads, sidewalk routes; Peel: Regional arterials;\[20\] residents: windrows |
| Region of Durham | Durham | https://www.durham.ca/en/living-here/regional-road-maintenance.aspx | November 12, 2026 | Region: Regional roads (no numeric LOS);\[3\] lower tiers: sidewalks |
| Pickering | Durham | https://www.pickering.ca/property-roads-safety/parking-roads-and-driveways/snow-removal-and-clearing/snow-clearing-process/ | November 12, 2026 | City: local roads, select sidewalks incl. Regional-road sidewalks; residents: sidewalks (24 hrs), windrows\[5\]\[37\] |
| Ajax | Durham | https://www.ajax.ca/en/inside-townhall/winter-response-information.aspx | November 12, 2026 | Town: roads, sidewalks, trails, crossings; residents: sidewalks (24 hrs), windrows (paid seniors program)\[38\]\[49\]\[51\] |
| Whitby | Durham | https://www.whitby.ca/services-and-payments/parking-roads-and-transportation/snow-clearing/ | November 12, 2026 | Town: Class 2–6 roads; Region: Class 1; residents: sidewalks (24 hrs); free seniors windrows |
| Oshawa | Durham | https://www.oshawa.ca/getting-around/snow-clearing/snow-clearing-activity-report/ | November 12, 2026 | City: roads (6/12/16 hrs); Region: Regional roads; owners: sidewalks by midnight next day; assistance program\[21\]\[52\] |
| Clarington | Durham | https://www.clarington.net/community-and-people/roads-and-transportation/snow-clearing-and-winter-maintenance/ | November 12, 2026 | Municipality: roads, primary-route sidewalks, PXOs; residents: other sidewalks (24 hrs); seniors bundle\[39\] |
| Uxbridge | Durham | NF | November 12, 2026 | DATA GAP |
| Scugog | Durham | https://www.scugog.ca/home-property-roads/roads-and-sidewalks/snowplowing-and-winter-operations/ | November 12, 2026 | Township: roads, select sidewalks; owners: sidewalks (24 hrs), windrows; Region: Regional roads |
| Brock | Durham | NF | November 12, 2026 | DATA GAP |
| Region of York | York | https://www.york.ca/transportation/roads/roads-operations | November 12, 2026 | Region: 4,400+ lane-km Regional roads, Regional bike lanes/MUPs; lower tiers: adjacent sidewalks |
| Vaughan | York | https://www.vaughan.ca/residential/roads-and-traffic/roads/winter-maintenance/snow-removal | November 12, 2026 | City: local roads, all sidewalks, universal windrows; Region: Regional roads |
| Markham | York | https://www.markham.ca/neighbourhood-services/roads-sidewalks/winter-road-services | November 12, 2026 | City: ~2,100 km roads, sidewalks, 60+/disability windrows; Region: Regional arterials |
| Richmond Hill | York | https://www.richmondhill.ca/en/living-here/Snow-Removal.aspx | November 12, 2026 | City: local roads, ~750 km sidewalks, universal windrows; Region: Regional roads |
| King | York | https://www.king.ca/transportation | November 12, 2026 | Township: roads, sidewalks (contracted), seniors windrows; Region: Regional roads |
| Aurora | York | https://www.aurora.ca/town-services/roads-and-traffic/winter-maintenance/ | November 12, 2026 (windrows re-verified November 23, 2026) | Town: roads incl. Yonge per Town table, all sidewalks, paid windrow pilot (seniors/disability); Region: Regional roads |
| Whitchurch-Stouffville | York | https://www.townofws.ca/live/roads-parking-and-traffic/winter-roads/snow-plowing/ | November 12, 2026 | Town: local roads, urban sidewalks, free seniors windrows; Region: Regional roads |
| Newmarket | York | https://www.newmarket.ca/roads-transportation/roads-sidewalks/snow-removal | November 12, 2026 | Town: local roads, 364 km sidewalks, windrow pilot; Region: Regional roads |
| East Gwillimbury | York | https://www.eastgwillimbury.ca/en/municipal-services/snow-clearing.aspx | November 12, 2026 | Town: local roads, all sidewalks; residents: windrows; Region: Regional roads |
| Georgina | York | https://www.georgina.ca/living-here/roads-and-sidewalks/winter-maintenance-and-snow-removal | November 12, 2026 | Town: local roads, 140 km sidewalks/paths, seniors windrows; Region: Regional roads |

## Recommendations
1. **Add helper columns before building the dashboard.** `Clock_Basis` = End of storm / Trigger depth reached / Per-round operating time / Not stated. `Source_Quality` = Official page / Official PDF / Secondary [2°]. `Conflict_Flag` = Yes/No, with `Conflict_Column` naming the disputed column, so the site marks individual cells without text-matching the notes.
2. **Close the data gaps first.** Uxbridge and Brock have no verified page. Request Halton Region's unpublished standards and the Durham and York council LOS tables. Retrieve Hamilton's full Appendix B to PW18096(a).
3. **Resolve the "Sources differ" cells before publishing:** Toronto arterial plowing (6 vs 6–8 hrs), Mississauga collector plowing (5 vs 2 cm), Vaughan collector and local completion (4/12 vs 16 hrs), King collector and local completion (16 vs 12 hrs), East Gwillimbury local plowing (8 vs 10 cm) and Burlington sidewalk completion (48 vs 72 hrs).
4. **Treat Oakville's [2°] road figures as provisional** until Oakville's own "Snow Clearing Standards" page is captured.

## Caveats
- Most rows for the York lower tiers, Whitby and Scugog come from search excerpts of official pages compiled by a research sub-agent, without opening the full pages. Re-check them at export.
- Pages are seasonal. Mississauga's page was modified November 4, 2026 and now lists windrow clearing as a standard service; Georgina's guide is dated 2022.
- Surface-condition terms are recorded only where the municipality uses them; NS does not imply a lower standard.
- "Maintained by Region" entries for arterials reflect page statements where found, and otherwise the standard two-tier split. Confirm against each Region's road map.

## Sources

1. [Road service maintenance levels - peelregion.ca](https://peelregion.ca/transportation-roads/road-maintenance/regular-road-servicing/road-service-maintenance-levels)
2. [Roads Operations](https://www.york.ca/transportation/roads/roads-operations)
3. [Regional Road Maintenance](https://www.durham.ca/en/living-here/regional-road-maintenance.aspx)
4. [Snow clearing](https://www.mississauga.ca/services-and-programs/transportation-and-streets/roads-and-sidewalks/snow-clearing/)
5. [Snow Safety Tips](https://www.pickering.ca/property-roads-safety/parking-roads-and-driveways/snow-removal-and-clearing/snow-safety-tips/)
6. [Salting & Plowing Roads](https://www.toronto.ca/services-payments/streets-parking-transportation/road-maintenance/winter-maintenance/levels-of-snow-clearing-service/)
7. [Snow Clearing - City of Richmond Hill](https://www.richmondhill.ca/en/living-here/Snow-Removal.aspx)
8. [Snow Removal](https://www.newmarket.ca/roads-transportation/roads-sidewalks/snow-removal)
9. [Snow Removal](https://www.vaughan.ca/residential/roads-and-traffic/roads/winter-maintenance/snow-removal)
10. [Snow Plowing - Stouffville](https://www.townofws.ca/live/roads-parking-and-traffic/winter-roads/snow-plowing/)
11. [Snow clearing](https://data.mississauga.ca/documents/0fcc651e0cc34060a0cee351c9fd03be)
12. [Snow Clearing](https://www.hamilton.ca/home-neighbourhood/getting-around/streets-sidewalks/snow-clearing)
13. [Halton Hills - Winter Maintenance](https://www.haltonhills.ca/live/maintenance-services/winter-maintenance)
14. [Snow clearing update - January 25, 2026](https://www.oakville.ca/town-hall/news-notices/snow-clearing-updates/snow-clearing-update-january-25-2026/)
15. [Snow Removal - Town of Milton](https://www.milton.ca/en/living-in-milton/snow-removal.aspx)
16. [Levels of Service](https://www1.brampton.ca/EN/residents/Roads-and-Traffic/Maintenance-Programs/Snow-Clearing-Operations/Pages/Levels-of-Service.aspx)
17. [Oshawa snow clearing and winter parking guide](https://snowplowtracker.com/city/oshawa-on/)
18. [Snowplowing and Winter Operations](https://www.scugog.ca/home-property-roads/roads-and-sidewalks/snowplowing-and-winter-operations/)
19. [Winter Maintenance - Halton Hills](https://www.haltonhills.ca/en/residents/winter-maintenance.aspx)
20. [Snow Removal - Town of Caledon](https://www.caledon.ca/en/town-services/snow-removal.aspx)
21. [Snow Clearing Activity Report](https://www.oshawa.ca/getting-around/snow-clearing/snow-clearing-activity-report/)
22. [Snow Clearing](https://www.whitby.ca/services-and-payments/parking-roads-and-transportation/snow-clearing/)
23. [Town of Georgina blue snow plow plowing in a sno Operations Division](https://www.georgina.ca/sites/default/files/2022-11/Winter%20Control%20Guide%202022%20-%20External%20-%20final.pdf)
24. [Snow Removal Cost in Oshawa: The 8 cm You Pay For](https://northlinepropertycare.ca/tips-snow-removal-cost-oshawa)
25. [Transportation Services](https://www.king.ca/transportation)
26. [Last updated on November 7, 2025](https://www.markham.ca/sites/default/files/2026-01/2025-2026%20Winter%20Operations%20Frequently%20Asked%20Questions.pdf)
27. [Richmond Hill is Snow Ready for Winter - City of Richmond Hill](https://www.richmondhill.ca/en/news/richmond-hill-is-snow-ready-for-winter.aspx)
28. [Residential Windrow Opening Pilot Program](https://www.heynewmarket.ca/windrows)
29. [Stouffville is Snow Ready: Winter Weather Tips and Reminders - Stouffville](https://www.townofws.ca/news/stouffville-is-snow-ready-winter-weather-tips-and-reminders/)
30. [Winter Maintenance](https://www.aurora.ca/town-services/roads-and-traffic/winter-maintenance/)
31. [Snow Clearing - The Town of East Gwillimbury](https://www.eastgwillimbury.ca/en/municipal-services/snow-clearing.aspx)
32. [New this winter: City to clear snow from all Mississauga sidewalks](https://www.stephendasko.com/new-this-winter-city-to-clear-snow-from-all-mississauga-sidewalks/)
33. [City of Burlington is ready for winter weather - City of Burlington](https://www.burlington.ca/en/news/city-of-burlington-is-ready-for-winter-weather.aspx)
34. [Sidewalk Snow Clearing](https://www.whitby.ca/town-hall/by-laws/sidewalk-snow-clearing/)
35. [Sidewalk Snow Clearing](https://www.hamilton.ca/home-neighbourhood/getting-around/streets-sidewalks/sidewalk-snow-clearing)
36. [By-Law Enforcement](https://www.brampton.ca/EN/residents/By-Law-Enforcement/pages/snow-ice-removal.aspx)
37. [Snow Removal and Clearing](https://www.pickering.ca/property-roads-safety/parking-roads-and-driveways/snow-removal-and-clearing/)
38. [Ajax Winter Tips and Reminders - Town of Ajax](https://www.ajax.ca/en/ajax-winter-tips-and-reminders.aspx)
39. [Sidewalk Snow Removal](https://www.clarington.net/snowremoval/)
40. [City sharing update regarding new sidewalk snow clearing service levels for the 2022/2023 season](https://www.hamilton.ca/city-council/news-notices/news-releases/city-sharing-update-regarding-new-sidewalk-snow-clearing)
41. [Milton residents can track snow-clearing progress online](https://halton.insauga.com/milton-residents-can-track-snow-clearing-progress-online/)
42. [Significant Weather Events - peelregion.ca](https://peelregion.ca/transportation-roads/road-maintenance/winter-operations/significant-weather-events)
43. [Attachment 3: Revised Snow Clearing Level of Service Table](https://www.toronto.ca/legdocs/mmis/2024/ie/bgrd/backgroundfile-246833.pdf)
44. [Driveway Windrow Snow Clearing](https://www.oakville.ca/transportation-roads/roads-sidewalks/snow-clearing/driveway-windrow-snow-clearing/)
45. [Snow removal - peelregion.ca](https://peelregion.ca/transportation-roads/road-maintenance/winter-operations/snow-removal)
46. [Roads 2026—2029 Business Plan and 2026 Budget](https://peelregion.ca/sites/default/files/2025-11/budget_2026_roads_business_plan.pdf)
47. [Snow Clearing Issue](https://www.durham.ca/regional-government/report-an-issue/snow-clearing-issue/)
48. [Snow Clearing Process](https://www.pickering.ca/property-roads-safety/parking-roads-and-driveways/snow-removal-and-clearing/snow-clearing-process/)
49. [Winter Response Information - Town of Ajax](https://www.ajax.ca/en/inside-townhall/winter-response-information.aspx)
50. [Winter is coming: TOA snow tips & reminders - Town of Ajax](https://www.ajax.ca/en/winter-is-coming-toa-snow-tips-reminders.aspx)
51. [TOWN OF AJAX 2026 - 2027 Snow Removal Program Seniors and Qualified Residents](https://ajax.ca/wp-content/uploads/2026/03/Senior-Snow-Application-Form-2026-2027.pdf)
52. [City of Oshawa Snow Clearing Assistance Program 2022- ...](https://www.oshawa.ca/media/41qb4tsj/snow-clearing-help-info-bulletin-2025-2026.pdf)
53. [Snow Clearing and Winter Maintenance](https://www.clarington.net/community-and-people/roads-and-transportation/snow-clearing-and-winter-maintenance/)
54. [Winter Maintenance of Sidewalks Adjacent to Regional ...](https://yorkpublishing.escribemeetings.com/filestream.ashx?DocumentId=36376)
55. [York Region responds to back‑to‑back winter storms, keeping roads safe](https://www.york.ca/newsroom/news/york-region-responds-back-back-winter-storms-keeping-roads-safe)
56. [The first snowfall of the season is on its way!](https://www.vaughan.ca/news/first-snowfall-season-its-way-1)
57. [Winter Road Services](https://www.markham.ca/neighbourhood-services/roads-sidewalks/winter-road-services)
58. [Winter Maintenance Frequently Asked Questions - City of Richmond Hill](https://www.richmondhill.ca/en/living-here/winter-maintenance-frequently-asked-questions.aspx)
59. [King Township opens applications for Senior Snow Removal Assistance Program](https://www.king.ca/your-local-government/news-and-notices/news-releases/king-township-opens-applications-senior-snow)
60. [Windrow Removal Pilot Program](https://www.aurora.ca/town-services/roads-and-traffic/winter-maintenance/windrow-removal-pilot-program/)
61. [York Region Snow Removal Assistance Network - Snow Removal Assistance - Whitchurch-Stouffville](https://211central.ca/record/92218663/)
62. [Applications open for Newmarket's windrow clearing program - Newmarket News](https://www.newmarkettoday.ca/local-news/applications-open-for-newmarkets-windrow-clearing-program-12874225)
63. [Winter Mapping - Town of Georgina](https://experience.arcgis.com/experience/e1dd25d0594d405294c79c5a48be769f?draft=true)
64. [Town declares winter maintenance event and significant weather event](https://www.georgina.ca/article/town-declares-winter-maintenance-event-and-significant-weather-event-0)
65. [Windrow Removal Pilot Program - Town of Aurora](https://www.aurora.ca/Windrow)
66. [Applications Open for Aurora's 2026-2027 Windrow Removal Program](https://www.aurora.ca/news/posts/applications-open-for-aurora-s-2026-2027-windrow-removal-program/)
