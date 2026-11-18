import { store } from './store.js';
const INTERCHANGE_PAIRS = [
    {
        station1: 'stn-dadar-wr',
        station2: 'stn-dadar-cr',
        name: 'Dadar Junction',
        walkMins: 4,
        instructions: 'Use central foot overbridge connecting WR Platforms 1-6 to CR Platforms 1-8.'
    },
    {
        station1: 'stn-andheri',
        station2: 'stn-andheri-metro',
        name: 'Andheri Hub',
        walkMins: 3,
        instructions: 'Take direct elevated skywalk from Railway PF 1/8 to Metro 1 Concourse.'
    },
    {
        station1: 'stn-ghatkopar',
        station2: 'stn-ghatkopar-metro',
        name: 'Ghatkopar Interchange',
        walkMins: 3,
        instructions: 'Use direct interconnected Foot Overbridge to Metro 1 ticketing concourse.'
    },
    {
        station1: 'stn-marol-naka-metro',
        station2: 'stn-marol-naka-m3',
        name: 'Marol Naka Concourse',
        walkMins: 3,
        instructions: 'Take direct underground escalator between Metro Line 1 and Metro Line 3.'
    },
    {
        station1: 'stn-weh-metro',
        station2: 'stn-gundavali-metro',
        name: 'WEH / Gundavali Link',
        walkMins: 4,
        instructions: 'Walk via elevated dedicated walkway connecting Metro 1 (WEH) and Metro 7 (Gundavali).'
    },
    {
        station1: 'stn-dn-nagar-metro',
        station2: 'stn-andheri-w-metro',
        name: 'D.N. Nagar Interchange',
        walkMins: 3,
        instructions: 'Use dedicated sky bridge connecting Metro 1 and Metro 2A.'
    },
    {
        station1: 'stn-dahisar',
        station2: 'stn-dahisar-e-metro',
        name: 'Dahisar East Junction',
        walkMins: 5,
        instructions: 'Walk 350m via station road between Suburban local station and Metro 2A/7 Terminus.'
    },
    {
        station1: 'stn-prabhadevi',
        station2: 'stn-parel',
        name: 'Prabhadevi - Parel Link',
        walkMins: 4,
        instructions: 'Use wide Elphinstone-Parel interchange foot overbridge.'
    },
    {
        station1: 'stn-santacruz',
        station2: 'stn-santacruz-m3',
        name: 'Santacruz Transit Hub',
        walkMins: 4,
        instructions: 'Use pedestrian subway between Western Railway Santacruz and Metro 3.'
    },
    {
        station1: 'stn-kurla',
        station2: 'stn-bkc-m3',
        name: 'Kurla - BKC Link',
        walkMins: 6,
        instructions: 'Board BEST Feeder Bus from Kurla Station West to BKC Metro 3 / Diamond Bourse.'
    },
    {
        station1: 'stn-bandra',
        station2: 'stn-bkc-m3',
        name: 'Bandra - BKC Link',
        walkMins: 6,
        instructions: 'Board BEST Feeder Bus AS-4 / 312 from Bandra Station East to BKC.'
    },
    {
        station1: 'stn-csmt',
        station2: 'stn-churchgate',
        name: 'CSMT - Churchgate Corridor',
        walkMins: 8,
        instructions: 'Take BEST Route A-115 or C-40 between CSMT and Churchgate Station.'
    }
];
// Major Fast Local Train Stop IDs on Western Railway
const WR_FAST_STATIONS = new Set([
    'stn-churchgate', 'stn-marine-lines', 'stn-charni-road', 'stn-grant-road',
    'stn-mumbai-central', 'stn-dadar-wr', 'stn-bandra', 'stn-andheri',
    'stn-borivali', 'stn-bhayandar', 'stn-vasai-road', 'stn-virar'
]);
// Major Fast Local Train Stop IDs on Central Railway
const CR_FAST_STATIONS = new Set([
    'stn-csmt', 'stn-byculla', 'stn-dadar-cr', 'stn-kurla',
    'stn-ghatkopar', 'stn-vikhroli', 'stn-bhandup', 'stn-mulund',
    'stn-thane', 'stn-diva', 'stn-dombivli', 'stn-kalyan'
]);
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function calculateStepDuration(mode, stopsCount, fromStn, toStn) {
    const dist = getDistanceKm(fromStn.latitude, fromStn.longitude, toStn.latitude, toStn.longitude);
    if (mode === 'metro') {
        // Dedicated grade-separated tracks: ~2.2 mins per stop
        return Math.max(4, Math.round(stopsCount * 2.2));
    }
    if (mode === 'bus') {
        // Road transit in Mumbai traffic: ~3.2 mins/km + stop dwell times
        return Math.max(10, Math.round(dist * 3.2) + Math.round(stopsCount * 1.5));
    }
    // Local suburban train
    return Math.max(5, Math.round(stopsCount * 2.4));
}
function buildMetroDetails(line, fromStn, toStn) {
    const isLine3 = line.id === 'metro-line-3';
    return {
        lineCode: line.code || 'METRO',
        lineName: line.name,
        operator: line.operator || 'Maha Mumbai Metro / MMOPL',
        platformOrGate: isLine3
            ? 'Platform 1 / 2 (Underground Concourse, Gate 1)'
            : 'Platform 1 / 2 (Elevated Concourse, Gate 2)',
        frequencyMins: line.averageFrequencyMins || 4,
        frequencyText: `Every ${line.averageFrequencyMins || 4} mins (Peak: 2.5 min)`,
        isAirConditioned: true,
        ticketingOptions: [
            'NCMC National Mobility RuPay Card',
            'Mumbai 1 Metro QR App',
            'Paper QR Token / WhatsApp Ticket'
        ],
        interchangeFOB: fromStn.isInterchange
            ? `Interchange available at ${fromStn.name} via direct concourse/FOB`
            : undefined,
        operatingHours: `${line.operatingHours?.start || '06:00'} - ${line.operatingHours?.end || '23:00'}`
    };
}
function buildBusDetails(line, fromStn, toStn) {
    const isAc = line.id.includes('as4') ||
        line.id.includes('312') ||
        line.id.includes('a115') ||
        line.name.toLowerCase().includes('ac');
    const busType = isAc
        ? line.id.includes('a115')
            ? 'Electric AC'
            : 'AC Express'
        : 'Ordinary Non-AC';
    const routeNo = line.code || line.id.replace('bus-route-', '').toUpperCase();
    return {
        busRouteNumber: routeNo,
        busType,
        operator: 'BEST Undertaking',
        boardingStop: `${fromStn.name} BEST Bus Stop`,
        alightingStop: `${toStn.name} Bus Stand`,
        frequencyMins: line.averageFrequencyMins || 10,
        frequencyText: `Every ${line.averageFrequencyMins || 10} mins`,
        operatingHours: `${line.operatingHours?.start || '05:30'} - ${line.operatingHours?.end || '23:00'}`,
        fareType: isAc ? '₹6 - ₹25 (Chalo Card / UPI QR / Cash)' : '₹6 - ₹15 (Chalo Card / UPI QR / Cash)',
        destinationBoardText: `Towards ${line.terminalB}`
    };
}
function buildTrainDetails(line, isFast, _fromStn, _toStn) {
    return {
        serviceType: isFast ? 'Fast Local' : 'Slow Local',
        carCount: isFast ? '15-car' : '12-car',
        operator: line.operator || 'Western Railway / Central Railway',
        platformHint: isFast ? 'Fast Track (PF 3 or 4)' : 'Slow Track (PF 1 or 2)',
        frequencyText: `Every ${line.averageFrequencyMins || 3} mins`,
        ticketingOptions: [
            'UTS Mobile App GPS QR',
            'ATVM Smart Card Ticket',
            'Booking Office Counter'
        ]
    };
}
function buildTransitConnections(fromStation, toStation, allStations, allLines) {
    const connections = {
        originMetroStations: [],
        originBestBuses: [],
        destinationMetroStations: [],
        destinationBestBuses: []
    };
    const findNearbyMetro = (stn) => {
        if (stn.mode === 'metro') {
            return [{
                    name: stn.name,
                    lineName: allLines.find(l => stn.lineIds.includes(l.id))?.name || 'Direct Metro',
                    lineCode: stn.code || 'MTR',
                    distanceWalkMins: 0
                }];
        }
        // Direct interchange link check
        const pairedStationIds = INTERCHANGE_PAIRS
            .filter(p => p.station1 === stn.id || p.station2 === stn.id)
            .map(p => (p.station1 === stn.id ? p.station2 : p.station1));
        const pairedMetros = allStations.filter(s => pairedStationIds.includes(s.id) && s.mode === 'metro');
        if (pairedMetros.length > 0) {
            return pairedMetros.map(m => {
                const pair = INTERCHANGE_PAIRS.find(p => (p.station1 === stn.id && p.station2 === m.id) || (p.station2 === stn.id && p.station1 === m.id));
                return {
                    name: m.name,
                    lineName: allLines.find(l => m.lineIds.includes(l.id))?.name || 'Mumbai Metro',
                    lineCode: m.code || 'MTR',
                    distanceWalkMins: pair?.walkMins || 3
                };
            });
        }
        // Geographically nearby metros (within 2.2 km)
        return allStations
            .filter(s => s.mode === 'metro' && s.id !== stn.id)
            .map(s => ({
            station: s,
            distKm: getDistanceKm(stn.latitude, stn.longitude, s.latitude, s.longitude)
        }))
            .filter(item => item.distKm <= 2.2)
            .sort((a, b) => a.distKm - b.distKm)
            .slice(0, 2)
            .map(item => ({
            name: item.station.name,
            lineName: allLines.find(l => item.station.lineIds.includes(l.id))?.name || 'Mumbai Metro',
            lineCode: item.station.code || 'MTR',
            distanceWalkMins: Math.max(3, Math.round(item.distKm * 12))
        }));
    };
    connections.originMetroStations = findNearbyMetro(fromStation);
    connections.destinationMetroStations = findNearbyMetro(toStation);
    const findServingBuses = (stn, isOrigin) => {
        const busLines = allLines.filter(l => l.mode === 'bus');
        const servingBusLines = busLines.filter(l => l.stationIds.includes(stn.id) ||
            l.stationIds.some(sid => {
                const s = allStations.find(st => st.id === sid);
                return s && getDistanceKm(stn.latitude, stn.longitude, s.latitude, s.longitude) <= 0.8;
            }));
        return servingBusLines.map(b => {
            const isAc = b.id.includes('as4') ||
                b.id.includes('312') ||
                b.id.includes('a115') ||
                b.name.toLowerCase().includes('ac');
            return {
                routeNumber: b.code || b.name.split(' ')[2] || 'BEST',
                destination: isOrigin ? b.terminalB : b.terminalA,
                frequency: `Every ${b.averageFrequencyMins || 10}m`,
                busType: isAc ? 'Electric AC' : 'Ordinary',
                stopName: `${stn.name} Bus Stand`
            };
        }).slice(0, 3);
    };
    connections.originBestBuses = findServingBuses(fromStation, true);
    connections.destinationBestBuses = findServingBuses(toStation, false);
    return connections;
}
export async function findRoutes(fromStationId, toStationId, allowedModes = ['train', 'metro', 'bus']) {
    const allStations = await store.getStations();
    const allLines = await store.getLines();
    const allReadings = await store.getCrowdReadings();
    const stationMap = new Map(allStations.map(s => [s.id, s]));
    const fromStation = stationMap.get(fromStationId);
    const toStation = stationMap.get(toStationId);
    if (!fromStation || !toStation || fromStationId === toStationId) {
        return [];
    }
    const crowdMap = new Map(allReadings.map(r => [r.stationId, r]));
    const getStationCrowd = (stnId) => {
        const reading = crowdMap.get(stnId);
        if (reading)
            return { level: reading.crowdLevel, source: reading.source };
        const name = stationMap.get(stnId)?.name.toLowerCase() || '';
        if (name.includes('dadar') || name.includes('andheri') || name.includes('kurla') || name.includes('ghatkopar') || name.includes('borivali') || name.includes('thane')) {
            return { level: 'high', source: 'historical_pattern' };
        }
        return { level: 'medium', source: 'historical_pattern' };
    };
    const results = [];
    const transitConnections = buildTransitConnections(fromStation, toStation, allStations, allLines);
    const filteredLines = allLines.filter(l => allowedModes.includes(l.mode));
    const directDistanceKm = getDistanceKm(fromStation.latitude, fromStation.longitude, toStation.latitude, toStation.longitude);
    // Helper: Slice intermediate station names strictly in direction of travel
    const getIntermediateNames = (line, sIdx, eIdx) => {
        if (sIdx === eIdx)
            return [];
        const ids = sIdx < eIdx
            ? line.stationIds.slice(sIdx + 1, eIdx)
            : line.stationIds.slice(eIdx + 1, sIdx).reverse();
        return ids.map(id => stationMap.get(id)?.name || id);
    };
    // -------------------------------------------------------------
    // 1. DIRECT SINGLE LINE ROUTES
    // -------------------------------------------------------------
    for (const line of filteredLines) {
        const fromIdx = line.stationIds.indexOf(fromStationId);
        const toIdx = line.stationIds.indexOf(toStationId);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
            const stepStops = Math.abs(toIdx - fromIdx);
            const intermediateNames = getIntermediateNames(line, fromIdx, toIdx);
            const durationMins = calculateStepDuration(line.mode, stepStops, fromStation, toStation);
            const originCrowd = getStationCrowd(fromStationId);
            const destCrowd = getStationCrowd(toStationId);
            const worstCrowd = (originCrowd.level === 'high' || destCrowd.level === 'high') ? 'high'
                : (originCrowd.level === 'medium' || destCrowd.level === 'medium') ? 'medium'
                    : 'low';
            let fare = 10;
            if (line.mode === 'train') {
                fare = stepStops > 15 ? 15 : stepStops > 8 ? 10 : 5;
            }
            else if (line.mode === 'metro') {
                fare = stepStops > 8 ? 30 : stepStops > 4 ? 20 : 10;
            }
            else {
                fare = stepStops > 10 ? 25 : 12;
            }
            const isFastTrainCandidate = line.mode === 'train' && stepStops >= 6;
            const baseStep = {
                stepIndex: 1,
                mode: line.mode,
                lineId: line.id,
                lineName: line.name,
                lineColor: line.color,
                fromStationId,
                fromStationName: fromStation.name,
                toStationId,
                toStationName: toStation.name,
                stopsCount: stepStops,
                durationMins,
                crowdLevel: worstCrowd,
                crowdSource: originCrowd.source,
                intermediateStations: intermediateNames,
                instructions: `Board ${line.name} towards ${toIdx > fromIdx ? line.terminalB : line.terminalA}. Ride for ${stepStops} stops.`,
                metroDetails: line.mode === 'metro' ? buildMetroDetails(line, fromStation, toStation) : undefined,
                busDetails: line.mode === 'bus' ? buildBusDetails(line, fromStation, toStation) : undefined,
                trainDetails: line.mode === 'train' ? buildTrainDetails(line, false, fromStation, toStation) : undefined
            };
            const titlePrefix = line.mode === 'metro'
                ? `Direct Metro: ${line.name}`
                : line.mode === 'bus'
                    ? `BEST Bus Direct: ${line.name}`
                    : `Direct Suburban Local: ${line.name}`;
            results.push({
                id: `direct-${line.id}-${results.length}`,
                title: titlePrefix,
                subtitle: `Direct • No transfers • ${stepStops} stops`,
                totalDurationMins: durationMins,
                totalTransfers: 0,
                modes: [line.mode],
                overallCrowd: worstCrowd,
                crowdScore: worstCrowd === 'high' ? 84 : worstCrowd === 'medium' ? 56 : 24,
                estimatedFareRupees: fare,
                steps: [baseStep],
                highlights: [
                    line.mode === 'metro'
                        ? 'Fully Air-Conditioned Metro • Screen doors'
                        : line.mode === 'bus'
                            ? 'Direct BEST Bus • Seat comfort available'
                            : 'Uninterrupted direct suburban track run',
                    `${stepStops} stops without platform change`,
                    worstCrowd === 'high' ? 'High passenger load during peak hours' : 'Optimal seat availability expected'
                ],
                recommendedCoach: line.mode === 'train'
                    ? 'Coach 4 or 9 (nearest to exit FOB)'
                    : line.mode === 'metro'
                        ? 'Middle Cars 3 & 4 (smooth alighting)'
                        : 'Front entrance near driver',
                transitConnections
            });
            // Suburban Fast Train Option
            if (isFastTrainCandidate) {
                const isWR = line.id === 'western-line';
                const isCR = line.id === 'central-line';
                const fastStationSet = isWR ? WR_FAST_STATIONS : isCR ? CR_FAST_STATIONS : null;
                const fastStopsList = intermediateNames.filter(name => {
                    const stn = allStations.find(s => s.name === name);
                    return stn && fastStationSet && fastStationSet.has(stn.id);
                });
                const fastDuration = Math.max(14, Math.round(durationMins * 0.65));
                const fastStep = {
                    ...baseStep,
                    stopsCount: fastStopsList.length + 1,
                    durationMins: fastDuration,
                    intermediateStations: fastStopsList,
                    instructions: `Board FAST local towards ${toIdx > fromIdx ? line.terminalB : line.terminalA}. Skips minor stations, stops only at junction hubs (${fastStopsList.length} fast stops).`,
                    trainDetails: buildTrainDetails(line, true, fromStation, toStation)
                };
                results.push({
                    id: `direct-fast-${line.id}`,
                    title: `FAST Local via ${line.name}`,
                    subtitle: `Express skips • Saves ~${durationMins - fastDuration} mins • ${fastStopsList.length + 1} express stops`,
                    totalDurationMins: fastDuration,
                    totalTransfers: 0,
                    modes: [line.mode],
                    overallCrowd: 'high',
                    crowdScore: 92,
                    estimatedFareRupees: fare,
                    steps: [fastStep],
                    highlights: [
                        'Fastest transit corridor between stations',
                        'Substantially reduced commute duration',
                        'Express skips intermediate local halts'
                    ],
                    recommendedCoach: 'Coaches 5 or 8 for prompt exit at destination platform',
                    transitConnections
                });
            }
        }
    }
    // -------------------------------------------------------------
    // 2. ONE-TRANSFER INTERCHANGE ROUTES (Geographically Validated)
    // -------------------------------------------------------------
    // Expand origin and destination to include directly connected multimodal hubs
    const originStationIds = [fromStationId];
    INTERCHANGE_PAIRS.forEach(p => {
        if (p.station1 === fromStationId && !originStationIds.includes(p.station2))
            originStationIds.push(p.station2);
        if (p.station2 === fromStationId && !originStationIds.includes(p.station1))
            originStationIds.push(p.station1);
    });
    const destStationIds = [toStationId];
    INTERCHANGE_PAIRS.forEach(p => {
        if (p.station1 === toStationId && !destStationIds.includes(p.station2))
            destStationIds.push(p.station2);
        if (p.station2 === toStationId && !destStationIds.includes(p.station1))
            destStationIds.push(p.station1);
    });
    const fromLines = filteredLines.filter(l => l.stationIds.some(sid => originStationIds.includes(sid)));
    const toLines = filteredLines.filter(l => l.stationIds.some(sid => destStationIds.includes(sid)));
    for (const line1 of fromLines) {
        for (const line2 of toLines) {
            if (line1.id === line2.id)
                continue;
            // Find which origin station connects to line1
            const actualOriginId = originStationIds.find(sid => line1.stationIds.includes(sid)) || fromStationId;
            const actualDestId = destStationIds.find(sid => line2.stationIds.includes(sid)) || toStationId;
            const originWalkMins = actualOriginId !== fromStationId ? 3 : 0;
            const destWalkMins = actualDestId !== toStationId ? 3 : 0;
            let interchangeStationId1 = null;
            let interchangeStationId2 = null;
            let transferWalkMins = 3;
            let transferInstructions = 'Walk to connecting platform.';
            // Check identical station in both lines (e.g. Kurla on CR & Harbour, or Dadar)
            for (const stnId of line1.stationIds) {
                if (line2.stationIds.includes(stnId)) {
                    interchangeStationId1 = stnId;
                    interchangeStationId2 = stnId;
                    break;
                }
            }
            // Check known interchange pairs
            if (!interchangeStationId1) {
                for (const pair of INTERCHANGE_PAIRS) {
                    const l1HasS1 = line1.stationIds.includes(pair.station1);
                    const l2HasS2 = line2.stationIds.includes(pair.station2);
                    const l1HasS2 = line1.stationIds.includes(pair.station2);
                    const l2HasS1 = line2.stationIds.includes(pair.station1);
                    if (l1HasS1 && l2HasS2) {
                        interchangeStationId1 = pair.station1;
                        interchangeStationId2 = pair.station2;
                        transferWalkMins = pair.walkMins;
                        transferInstructions = pair.instructions;
                        break;
                    }
                    else if (l1HasS2 && l2HasS1) {
                        interchangeStationId1 = pair.station2;
                        interchangeStationId2 = pair.station1;
                        transferWalkMins = pair.walkMins;
                        transferInstructions = pair.instructions;
                        break;
                    }
                }
            }
            if (interchangeStationId1 &&
                interchangeStationId2 &&
                interchangeStationId1 !== actualOriginId &&
                interchangeStationId2 !== actualDestId) {
                const jStn1 = stationMap.get(interchangeStationId1);
                const jStn2 = stationMap.get(interchangeStationId2);
                if (!jStn1 || !jStn2)
                    continue;
                // GEOGRAPHIC DETOUR CHECK: Ensure transfer doesn't travel in reverse direction
                const distLeg1 = getDistanceKm(fromStation.latitude, fromStation.longitude, jStn1.latitude, jStn1.longitude);
                const distLeg2 = getDistanceKm(jStn2.latitude, jStn2.longitude, toStation.latitude, toStation.longitude);
                const totalViaDist = distLeg1 + distLeg2;
                if (totalViaDist > Math.max(directDistanceKm * 1.9, directDistanceKm + 8)) {
                    continue; // Skip illogical detours
                }
                const fromIdx1 = line1.stationIds.indexOf(actualOriginId);
                const jIdx1 = line1.stationIds.indexOf(interchangeStationId1);
                const stops1 = Math.abs(jIdx1 - fromIdx1);
                if (stops1 === 0)
                    continue;
                const jIdx2 = line2.stationIds.indexOf(interchangeStationId2);
                const toIdx2 = line2.stationIds.indexOf(actualDestId);
                const stops2 = Math.abs(toIdx2 - jIdx2);
                if (stops2 === 0)
                    continue;
                const intermediate1 = getIntermediateNames(line1, fromIdx1, jIdx1);
                const intermediate2 = getIntermediateNames(line2, jIdx2, toIdx2);
                const originStnObj = stationMap.get(actualOriginId) || fromStation;
                const destStnObj = stationMap.get(actualDestId) || toStation;
                const dur1 = calculateStepDuration(line1.mode, stops1, originStnObj, jStn1);
                const dur2 = calculateStepDuration(line2.mode, stops2, jStn2, destStnObj);
                const totalDuration = dur1 + transferWalkMins + dur2 + originWalkMins + destWalkMins;
                const c1 = getStationCrowd(actualOriginId);
                const cJ = getStationCrowd(interchangeStationId1);
                const c2 = getStationCrowd(actualDestId);
                const worstCrowd = c1.level === 'high' || cJ.level === 'high' || c2.level === 'high' ? 'high'
                    : c1.level === 'medium' || cJ.level === 'medium' || c2.level === 'medium' ? 'medium'
                        : 'low';
                const step1 = {
                    stepIndex: 1,
                    mode: line1.mode,
                    lineId: line1.id,
                    lineName: line1.name,
                    lineColor: line1.color,
                    fromStationId: originStnObj.id,
                    fromStationName: originStnObj.name,
                    toStationId: jStn1.id,
                    toStationName: jStn1.name,
                    stopsCount: stops1,
                    durationMins: dur1 + originWalkMins,
                    crowdLevel: c1.level,
                    crowdSource: c1.source,
                    intermediateStations: intermediate1,
                    instructions: originWalkMins > 0
                        ? `Walk ~${originWalkMins}m via skywalk to ${originStnObj.name}. Take ${line1.name} to ${jStn1.name} (${stops1} stops).`
                        : `Take ${line1.name} from ${originStnObj.name} to ${jStn1.name} (${stops1} stops).`,
                    metroDetails: line1.mode === 'metro' ? buildMetroDetails(line1, originStnObj, jStn1) : undefined,
                    busDetails: line1.mode === 'bus' ? buildBusDetails(line1, originStnObj, jStn1) : undefined,
                    trainDetails: line1.mode === 'train' ? buildTrainDetails(line1, false, originStnObj, jStn1) : undefined
                };
                const step2 = {
                    stepIndex: 2,
                    mode: line2.mode,
                    lineId: line2.id,
                    lineName: line2.name,
                    lineColor: line2.color,
                    fromStationId: jStn2.id,
                    fromStationName: jStn2.name,
                    toStationId: destStnObj.id,
                    toStationName: destStnObj.name,
                    stopsCount: stops2,
                    durationMins: dur2 + destWalkMins,
                    crowdLevel: c2.level,
                    crowdSource: c2.source,
                    transferWalkTimeMins: transferWalkMins,
                    intermediateStations: intermediate2,
                    instructions: `Transfer at ${jStn1.name} (~${transferWalkMins} min walk). ${transferInstructions} Board ${line2.name} to ${destStnObj.name} (${stops2} stops).${destWalkMins > 0 ? ` Alight and walk ${destWalkMins}m to ${toStation.name}.` : ''}`,
                    metroDetails: line2.mode === 'metro' ? buildMetroDetails(line2, jStn2, destStnObj) : undefined,
                    busDetails: line2.mode === 'bus' ? buildBusDetails(line2, jStn2, destStnObj) : undefined,
                    trainDetails: line2.mode === 'train' ? buildTrainDetails(line2, false, jStn2, destStnObj) : undefined
                };
                const modesSet = Array.from(new Set([line1.mode, line2.mode]));
                const fare1 = line1.mode === 'metro' ? 20 : line1.mode === 'bus' ? 12 : 10;
                const fare2 = line2.mode === 'metro' ? 20 : line2.mode === 'bus' ? 12 : 10;
                let title = `Via ${jStn1.name} Interchange (${line1.code || line1.name} → ${line2.code || line2.name})`;
                if (line1.mode === 'metro' && line2.mode === 'metro') {
                    title = `Metro Link via ${jStn1.name} (${line1.code} → ${line2.code})`;
                }
                else if (modesSet.includes('bus') && !modesSet.includes('metro')) {
                    title = `Rail + BEST Bus Feeder via ${jStn1.name}`;
                }
                else if (modesSet.includes('metro') && !modesSet.includes('bus')) {
                    title = `Local Rail + AC Metro via ${jStn1.name}`;
                }
                results.push({
                    id: `transfer-${line1.id}-${line2.id}-${results.length}`,
                    title,
                    subtitle: `1 transfer at ${jStn1.name} • ${stops1 + stops2} total stops`,
                    totalDurationMins: totalDuration,
                    totalTransfers: 1,
                    modes: modesSet,
                    overallCrowd: worstCrowd,
                    crowdScore: worstCrowd === 'high' ? 80 : worstCrowd === 'medium' ? 52 : 30,
                    estimatedFareRupees: fare1 + fare2,
                    steps: [step1, step2],
                    highlights: [
                        `Interchange: ${jStn1.name} (~${transferWalkMins} min walkway)`,
                        modesSet.includes('metro')
                            ? 'Includes air-conditioned metro comfort'
                            : modesSet.includes('bus')
                                ? 'Includes direct BEST feeder connection'
                                : 'Direct suburban railway interchange',
                        'Synchronized timetable connection'
                    ],
                    recommendedCoach: `Transfer at ${jStn1.name}: use middle overbridge stairs for fastest platform exit`,
                    transitConnections
                });
            }
        }
    }
    // -------------------------------------------------------------
    // 3. TWO-TRANSFER MULTI-HOP ROUTES (e.g. Metro 2A -> Metro 1 -> Central Line)
    // Only search if NO direct or single-transfer route exists
    // -------------------------------------------------------------
    if (results.length === 0) {
        for (const line1 of fromLines) {
            for (const line3 of toLines) {
                if (line1.id === line3.id)
                    continue;
                // Find intermediate connecting lines (line2)
                for (const line2 of filteredLines) {
                    if (line2.id === line1.id || line2.id === line3.id)
                        continue;
                    // Check if line1 connects to line2, and line2 connects to line3
                    const hub1Matches = INTERCHANGE_PAIRS.filter(p => (line1.stationIds.includes(p.station1) && line2.stationIds.includes(p.station2)) ||
                        (line1.stationIds.includes(p.station2) && line2.stationIds.includes(p.station1)));
                    const hub2Matches = INTERCHANGE_PAIRS.filter(p => (line2.stationIds.includes(p.station1) && line3.stationIds.includes(p.station2)) ||
                        (line2.stationIds.includes(p.station2) && line3.stationIds.includes(p.station1)));
                    if (hub1Matches.length > 0 && hub2Matches.length > 0) {
                        const h1 = hub1Matches[0];
                        const h2 = hub2Matches[0];
                        const j1Id = line1.stationIds.includes(h1.station1) ? h1.station1 : h1.station2;
                        const j2Id = line2.stationIds.includes(h1.station2) ? h1.station2 : h1.station1;
                        const j3Id = line2.stationIds.includes(h2.station1) ? h2.station1 : h2.station2;
                        const j4Id = line3.stationIds.includes(h2.station2) ? h2.station2 : h2.station1;
                        if (j1Id !== fromStationId && j4Id !== toStationId && j2Id !== j3Id) {
                            const jStn1 = stationMap.get(j1Id);
                            const jStn2 = stationMap.get(j2Id);
                            const jStn3 = stationMap.get(j3Id);
                            const jStn4 = stationMap.get(j4Id);
                            if (jStn1 && jStn2 && jStn3 && jStn4) {
                                const fIdx1 = line1.stationIds.indexOf(fromStationId);
                                const jIdx1 = line1.stationIds.indexOf(j1Id);
                                const stops1 = Math.abs(jIdx1 - fIdx1);
                                const jIdx2 = line2.stationIds.indexOf(j2Id);
                                const jIdx3 = line2.stationIds.indexOf(j3Id);
                                const stops2 = Math.abs(jIdx3 - jIdx2);
                                const jIdx4 = line3.stationIds.indexOf(j4Id);
                                const tIdx3 = line3.stationIds.indexOf(toStationId);
                                const stops3 = Math.abs(tIdx3 - jIdx4);
                                if (stops1 > 0 && stops2 > 0 && stops3 > 0) {
                                    const intermediate1 = getIntermediateNames(line1, fIdx1, jIdx1);
                                    const intermediate2 = getIntermediateNames(line2, jIdx2, jIdx3);
                                    const intermediate3 = getIntermediateNames(line3, jIdx4, tIdx3);
                                    const dur1 = Math.round(stops1 * (line1.mode === 'metro' ? 2 : 2.5));
                                    const dur2 = Math.round(stops2 * (line2.mode === 'metro' ? 2 : 2.5));
                                    const dur3 = Math.round(stops3 * (line3.mode === 'metro' ? 2 : 2.5));
                                    const totalDur = dur1 + h1.walkMins + dur2 + h2.walkMins + dur3;
                                    const step1 = {
                                        stepIndex: 1,
                                        mode: line1.mode,
                                        lineId: line1.id,
                                        lineName: line1.name,
                                        lineColor: line1.color,
                                        fromStationId,
                                        fromStationName: fromStation.name,
                                        toStationId: jStn1.id,
                                        toStationName: jStn1.name,
                                        stopsCount: stops1,
                                        durationMins: dur1,
                                        crowdLevel: 'medium',
                                        crowdSource: 'live_sensor',
                                        intermediateStations: intermediate1,
                                        instructions: `Take ${line1.name} to ${jStn1.name}.`
                                    };
                                    const step2 = {
                                        stepIndex: 2,
                                        mode: line2.mode,
                                        lineId: line2.id,
                                        lineName: line2.name,
                                        lineColor: line2.color,
                                        fromStationId: jStn2.id,
                                        fromStationName: jStn2.name,
                                        toStationId: jStn3.id,
                                        toStationName: jStn3.name,
                                        stopsCount: stops2,
                                        durationMins: dur2,
                                        crowdLevel: 'low',
                                        crowdSource: 'verified_survey',
                                        transferWalkTimeMins: h1.walkMins,
                                        intermediateStations: intermediate2,
                                        instructions: `Transfer at ${jStn1.name} (~${h1.walkMins}m). Board ${line2.name} to ${jStn3.name}.`
                                    };
                                    const step3 = {
                                        stepIndex: 3,
                                        mode: line3.mode,
                                        lineId: line3.id,
                                        lineName: line3.name,
                                        lineColor: line3.color,
                                        fromStationId: jStn4.id,
                                        fromStationName: jStn4.name,
                                        toStationId,
                                        toStationName: toStation.name,
                                        stopsCount: stops3,
                                        durationMins: dur3,
                                        crowdLevel: 'medium',
                                        crowdSource: 'historical_pattern',
                                        transferWalkTimeMins: h2.walkMins,
                                        intermediateStations: intermediate3,
                                        instructions: `Transfer at ${jStn3.name} (~${h2.walkMins}m). Board ${line3.name} to ${toStation.name}.`
                                    };
                                    const modesSet = Array.from(new Set([line1.mode, line2.mode, line3.mode]));
                                    results.push({
                                        id: `multi-${results.length}`,
                                        title: `Cross-Corridor Link via ${jStn1.name} & ${jStn3.name}`,
                                        subtitle: `2 transfers (${jStn1.name}, ${jStn3.name}) • ${stops1 + stops2 + stops3} total stops`,
                                        totalDurationMins: totalDur,
                                        totalTransfers: 2,
                                        modes: modesSet,
                                        overallCrowd: 'medium',
                                        crowdScore: 54,
                                        estimatedFareRupees: 45,
                                        steps: [step1, step2, step3],
                                        highlights: [
                                            `Interchange hubs at ${jStn1.name} and ${jStn3.name}`,
                                            'Covers East-West transit bridges seamlessly',
                                            'Air-conditioned connectivity included'
                                        ],
                                        recommendedCoach: 'Platform transfer skywalks located at center of train',
                                        transitConnections
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Deduplicate routes with identical sequence of modes and transfer points
    const seenSignatures = new Set();
    const deduplicated = [];
    for (const r of results) {
        const signature = `${r.title}|` + r.steps.map(s => `${s.lineId || s.lineName}:${s.fromStationId}->${s.toStationId}`).join('|');
        if (!seenSignatures.has(signature)) {
            seenSignatures.add(signature);
            deduplicated.push(r);
        }
    }
    // Sort: Direct routes first, then by total duration
    deduplicated.sort((a, b) => {
        if (a.totalTransfers !== b.totalTransfers) {
            return a.totalTransfers - b.totalTransfers;
        }
        return a.totalDurationMins - b.totalDurationMins;
    });
    return deduplicated.slice(0, 6);
}
