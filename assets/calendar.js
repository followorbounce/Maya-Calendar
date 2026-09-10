/* ============================================================
   JU'UN K'IN — shared calendar engine  (window.MC)

   Classic Maya reckoning: Long Count, Tzolk'in, Haab',
   Calendar Round, Lords of the Night, 819-day count,
   an astronomical lunar approximation, plus the modern
   Dreamspell (13:20) count kept clearly separate.

   Correlation: GMT 584283  ( 0.0.0.0.0 = 11 Aug 3114 BCE
   proleptic Gregorian; 13.0.0.0.0 = 21 Dec 2012 ).
   ============================================================ */
(function (global) {
  "use strict";

  var CORRELATION = 584283;

  /* ---------- Gregorian <-> Julian Day Number ---------- */
  function gregorianToJDN(y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var yy = y + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
      Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function jdnToGregorian(jdn) {
    var a = jdn + 32044;
    var b = Math.floor((4 * a + 3) / 146097);
    var c = a - Math.floor((146097 * b) / 4);
    var dd = Math.floor((4 * c + 3) / 1461);
    var e = c - Math.floor((1461 * dd) / 4);
    var m = Math.floor((5 * e + 2) / 153);
    return {
      d: e - Math.floor((153 * m + 2) / 5) + 1,
      m: m + 3 - 12 * Math.floor(m / 10),
      y: 100 * b + dd - 4800 + Math.floor(m / 10)
    };
  }
  function mod(n, k) { return ((n % k) + k) % k; }

  /* ---------- name tables ---------- */
  var DAY_SIGNS = ["Imix", "Ik'", "Ak'bal", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat",
    "Muluk", "Ok", "Chuwen", "Eb'", "Ben", "Ix", "Men", "Kib'", "Kaban", "Etz'nab'", "Kawak", "Ajaw"];
  var HAAB_MONTHS = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en",
    "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];
  var LORDS = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"];

  /* ---------- Long Count ---------- */
  function longCountFromTotal(total) {
    var rem = total;
    var baktun = Math.floor(rem / 144000); rem -= baktun * 144000;
    var katun = Math.floor(rem / 7200); rem -= katun * 7200;
    var tun = Math.floor(rem / 360); rem -= tun * 360;
    var uinal = Math.floor(rem / 20); rem -= uinal * 20;
    return { baktun: baktun, katun: katun, tun: tun, uinal: uinal, kin: rem };
  }
  function totalFromLongCount(b, ka, t, u, ki) {
    return b * 144000 + ka * 7200 + t * 360 + u * 20 + ki;
  }
  function formatLC(lc) {
    return lc.baktun + "." + lc.katun + "." + lc.tun + "." + lc.uinal + "." + lc.kin;
  }

  /* ---------- Tzolk'in ---------- */
  function tzolkinFromTotal(total) {
    var num = mod(total + 3, 13) + 1;
    var idx = mod(total + 19, 20);
    return { num: num, sign: DAY_SIGNS[idx], signIndex: idx, ordinal: mod(total + 159, 260) + 1 };
  }
  function trecenaOf(tz) {
    // trecena = the 13-day period, identified by its day-1 sign.
    // Tzolk'in ordinal 1 is "1 Imix" (sign index 0), so ordinal o has
    // sign index (o-1) mod 20 and number (o-1) mod 13 + 1.
    var startOrdinal = tz.ordinal - (tz.num - 1);
    if (startOrdinal < 1) startOrdinal += 260;
    var startIdx = mod(startOrdinal - 1, 20);
    return {
      number: Math.floor((startOrdinal - 1) / 13) + 1,
      startSign: DAY_SIGNS[startIdx],
      startOrdinal: startOrdinal
    };
  }

  /* ---------- Haab' ---------- */
  function haabFromTotal(total) {
    var doy = mod(total + 348, 365);
    if (doy < 360) {
      var month = Math.floor(doy / 20);
      return { day: doy - month * 20, month: HAAB_MONTHS[month], monthIndex: month, doy: doy };
    }
    return { day: doy - 360, month: "Wayeb'", monthIndex: 18, doy: doy };
  }
  // "seating" convention: day 0 of a month is written "chum <month>"
  function haabLabel(hb) {
    return (hb.day === 0 ? "Seating of " : hb.day + " ") + hb.month;
  }

  /* ---------- Lords of the Night (Glyph G) ---------- */
  function lordFromTotal(total) {
    // Reconstructed; convention here aligns 0.0.0.0.0 to G9. Debated among specialists.
    return LORDS[mod(total + 8, 9)];
  }

  /* ---------- Calendar Round ---------- */
  function calendarRoundPosition(total) { return mod(total, 18980); }
  function calendarRoundLabel(r) {
    return r.tz.num + " " + r.tz.sign + " " + haabLabel(r.hb);
  }
  // next time this exact Tzolk'in+Haab' pair recurs (always +18980 days)
  function nextCalendarRoundRecurrence(total) { return total + 18980; }

  /* ---------- 819-day count ----------
     Anchored so a station falls on the era base (0.0.0.0.0); real
     inscriptions cite their own stations. Four-part colour-direction
     cycle: East/red -> North/white -> West/black -> South/yellow. */
  var E819_DIRS = [
    { dir: "East", color: "red", hex: "#AE4227" },
    { dir: "North", color: "white", hex: "#E9E3D2" },
    { dir: "West", color: "black", hex: "#1B1712" },
    { dir: "South", color: "yellow", hex: "#BD8A2E" }
  ];
  function count819(total) {
    var sinceStation = mod(total, 819);
    var stationIndex = Math.floor((total - sinceStation) / 819);
    return {
      sinceStation: sinceStation,
      daysToNext: (819 - sinceStation) % 819,
      station: E819_DIRS[mod(stationIndex, 4)],
      stationIndex: stationIndex
    };
  }

  /* ---------- Lunar / Supplementary Series (astronomical) ----------
     Approximation from a modern synodic reference, NOT the reconstructed
     Classic lunar-series value. Anchor: new moon 2000-01-06 18:14 UT. */
  var SYNODIC = 29.530588853;
  var MOON_ANCHOR_JD = 2451550.26;
  var MOON_ANCHOR_LUNATION = 953; // Brown lunation number at anchor
  function lunar(jdn) {
    var elapsed = jdn - MOON_ANCHOR_JD;
    var lun = Math.floor(elapsed / SYNODIC);
    var age = elapsed - lun * SYNODIC;
    var lunationNo = MOON_ANCHOR_LUNATION + lun;
    return {
      ageDays: age,
      ageInt: Math.floor(age),
      phaseFraction: age / SYNODIC,
      lunationNo: lunationNo,
      glyphC: mod(lunationNo, 6) + 1           // position in the 6-lunation cycle
    };
  }

  /* ---------- Haab' year bearers ---------- */
  // Which day sign can fall on 1 Pop. Two historically attested systems.
  var YEAR_BEARERS = {
    classicTikal: ["Ik'", "Manik'", "Eb'", "Kaban"],
    colonialYucatec: ["K'an", "Muluk", "Ix", "Kawak"]
  };
  function yearBearer(total, system) {
    // find the total for 1 Pop of the current Haab' year, read its Tzolk'in sign
    var hb = haabFromTotal(total);
    var newYearTotal = total - hb.doy; // 0 Pop (seating); 1 Pop is +1 in some conventions
    var s1Pop = tzolkinFromTotal(newYearTotal + 1).sign;
    var s0Pop = tzolkinFromTotal(newYearTotal).sign;
    return { seating: s0Pop, firstOfPop: s1Pop, system: system || "classicTikal" };
  }

  /* ---------- period endings ---------- */
  function nextPeriodEndings(total) {
    function nx(u) { return (Math.floor(total / u) + 1) * u; }
    return {
      tun: nx(360), hotun: nx(1800), lahuntun: nx(3600), katun: nx(7200), baktun: nx(144000)
    };
  }

  /* ---------- full reading ---------- */
  function readingFromTotal(total) {
    var jdn = total + CORRELATION;
    var tz = tzolkinFromTotal(total);
    var hb = haabFromTotal(total);
    return {
      total: total,
      jdn: jdn,
      greg: jdnToGregorian(jdn),
      lc: longCountFromTotal(total),
      tz: tz,
      hb: hb,
      trecena: trecenaOf(tz),
      lord: lordFromTotal(total),
      crPos: calendarRoundPosition(total),
      e819: count819(total),
      lunar: lunar(jdn),
      periodEndings: nextPeriodEndings(total)
    };
  }
  function readingFromGregorian(y, m, d) {
    return readingFromTotal(gregorianToJDN(y, m, d) - CORRELATION);
  }
  function readingFromLongCount(b, ka, t, u, ki) {
    return readingFromTotal(totalFromLongCount(b, ka, t, u, ki));
  }

  /* ---------- "today" in a timezone ---------- */
  function todayInZone(tz) {
    var now = new Date();
    var parts;
    try {
      parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(now).reduce(function (o, p) { o[p.type] = p.value; return o; }, {});
    } catch (e) {
      parts = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
    }
    return { y: +parts.year, m: +parts.month, d: +parts.day };
  }

  var MONTHS_G = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  function formatGregorian(g) {
    return MONTHS_G[g.m - 1] + " " + g.d + ", " + (g.y <= 0 ? (1 - g.y) + " BCE" : g.y + " CE");
  }

  /* ============================================================
     DREAMSPELL  (13:20) — a MODERN system (José & Lloydine
     Argüelles, 1987/1990). Not the Maya calendar, not used by
     Maya communities. Its 260-count skips 29 February, so it
     drifts from the living Tzolk'in kept by daykeepers.

     Anchored: 26 July 1987 = Kin 34 (Blue Galactic Wizard),
     the Harmonic Convergence kin used by the standard kit.
     ============================================================ */
  var DS_SEALS = ["Red Dragon", "White Wind", "Blue Night", "Yellow Seed", "Red Serpent",
    "White World-Bridger", "Blue Hand", "Yellow Star", "Red Moon", "White Dog",
    "Blue Monkey", "Yellow Human", "Red Skywalker", "White Wizard", "Blue Eagle",
    "Yellow Warrior", "Red Earth", "White Mirror", "Blue Storm", "Yellow Sun"];
  var DS_SEAL_MAYA = ["Imix", "Ik'", "Ak'bal", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat",
    "Muluk", "Ok", "Chuwen", "Eb'", "Ben", "Ix", "Men", "Kib'", "Kaban", "Etz'nab'", "Kawak", "Ajaw"];
  var DS_TONES = ["Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic",
    "Resonant", "Galactic", "Solar", "Planetary", "Spectral", "Crystal", "Cosmic"];
  var DS_TONE_ACTION = ["Attract / Purpose", "Stabilize / Challenge", "Bond / Service",
    "Define / Form", "Empower / Radiance", "Organize / Equality", "Channel / Attunement",
    "Harmonize / Integrity", "Pulse / Intention", "Perfect / Manifestation",
    "Dissolve / Liberation", "Dedicate / Cooperation", "Endure / Transcendence"];
  var DS_COLORS = ["Red", "White", "Blue", "Yellow"];
  var DS_ANCHOR = { y: 1987, m: 7, d: 26, kin: 34 };

  function countFeb29Between(jdnA, jdnB) {
    // signed count of 29-Feb dates strictly after the earlier JDN, up to and including the later one
    var lo = Math.min(jdnA, jdnB), hi = Math.max(jdnA, jdnB);
    var gLo = jdnToGregorian(lo), gHi = jdnToGregorian(hi);
    var count = 0;
    for (var y = gLo.y; y <= gHi.y; y++) {
      var leap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
      if (!leap) continue;
      var f = gregorianToJDN(y, 2, 29);
      if (f > lo && f <= hi) count++;
    }
    return (jdnB >= jdnA) ? count : -count;
  }

  function dreamspell(y, m, d) {
    var jdn = gregorianToJDN(y, m, d);
    var anchorJdn = gregorianToJDN(DS_ANCHOR.y, DS_ANCHOR.m, DS_ANCHOR.d);
    var n = (jdn - anchorJdn) - countFeb29Between(anchorJdn, jdn);
    var kin = mod(DS_ANCHOR.kin - 1 + n, 260) + 1;
    return kinDetail(kin);
  }
  function kinDetail(kin) {
    var seal = mod(kin - 1, 20) + 1;
    var tone = mod(kin - 1, 13) + 1;
    var colorIdx = mod(seal - 1, 4);
    // wavespell: 13-day run beginning at tone 1
    var wsStart = mod(kin - (tone - 1) - 1, 260) + 1;
    var wsSeal = mod(wsStart - 1, 20) + 1;
    // Oracle (standard published formulas)
    var analogSeal = seal === 20 ? 20 : (seal === 10 ? 10 : 20 - seal);
    var antipodeSeal = mod(seal - 1 + 10, 20) + 1;
    var guideOffset = [0, 12, 4, 16, 8][(tone - 1) % 5];
    var guideSeal = mod(seal - 1 + guideOffset, 20) + 1;
    var occultKin = 261 - kin;
    function k(sealNo, toneNo) { // rebuild a kin from seal+tone via CRT-ish search
      for (var i = 0; i < 260; i++) {
        if (mod(i, 20) + 1 === sealNo && mod(i, 13) + 1 === toneNo) return i + 1;
      }
      return null;
    }
    return {
      kin: kin,
      seal: seal, sealName: DS_SEALS[seal - 1], sealMaya: DS_SEAL_MAYA[seal - 1],
      tone: tone, toneName: DS_TONES[tone - 1], toneAction: DS_TONE_ACTION[tone - 1],
      color: DS_COLORS[colorIdx],
      signature: DS_COLORS[colorIdx] + " " + DS_TONES[tone - 1] + " " + DS_SEALS[seal - 1].replace(/^(Red|White|Blue|Yellow)\s/, ""),
      wavespell: { startKin: wsStart, seal: wsSeal, name: DS_SEALS[wsSeal - 1] },
      oracle: {
        destiny: kinDetailShallow(kin),
        analog: kinDetailShallow(k(analogSeal, tone)),
        antipode: kinDetailShallow(k(antipodeSeal, tone)),
        guide: kinDetailShallow(k(guideSeal, tone)),
        occult: kinDetailShallow(occultKin)
      }
    };
  }
  function kinDetailShallow(kin) {
    if (!kin) return null;
    var seal = mod(kin - 1, 20) + 1, tone = mod(kin - 1, 13) + 1;
    return {
      kin: kin, seal: seal, tone: tone,
      sealName: DS_SEALS[seal - 1], toneName: DS_TONES[tone - 1],
      color: DS_COLORS[mod(seal - 1, 4)]
    };
  }
  // How far the Dreamspell count sits from the traditional Tzolk'in for a date
  function dreamspellVsTraditional(y, m, d) {
    var trad = readingFromGregorian(y, m, d).tz.ordinal;
    var ds = dreamspell(y, m, d).kin;
    return { traditionalOrdinal: trad, dreamspellKin: ds, offset: mod(ds - trad, 260) };
  }

  /* ---------- deep-link helpers ---------- */
  function parseQuery() {
    var q = {}, s = global.location.search.replace(/^\?/, '');
    s.split('&').forEach(function (p) {
      if (!p) return;
      var kv = p.split('=');
      q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return q;
  }

  /* ---------- descriptive datasets ---------- */
  var LONG_COUNT_UNITS = [
    { name: "K'in", days: 1, note: "1 day" },
    { name: "Winal", days: 20, note: "20 k'in" },
    { name: "Tun", days: 360, note: "18 winal — the one irregular step" },
    { name: "K'atun", days: 7200, note: "20 tun (≈ 19.7 years)" },
    { name: "B'ak'tun", days: 144000, note: "20 k'atun (≈ 394 years)" },
    { name: "Piktun", days: 2880000, note: "20 b'ak'tun — rare in Classic texts" },
    { name: "Kalabtun", days: 57600000, note: "20 piktun — Distance Numbers / mythic dates" },
    { name: "K'inchiltun", days: 1152000000, note: "20 kalabtun — largely theoretical" },
    { name: "Alautun", days: 23040000000, note: "20 k'inchiltun — attested chiefly at Palenque" }
  ];

  var DAY_SIGN_MEANING = {
    "Imix": "Waterlily / primordial sea", "Ik'": "Wind / breath",
    "Ak'bal": "Night / darkness", "K'an": "Maize seed / yellow / ripeness",
    "Chikchan": "Celestial serpent", "Kimi": "Death", "Manik'": "Deer / grasping hand",
    "Lamat": "Venus / star", "Muluk": "Water / jade", "Ok": "Dog",
    "Chuwen": "Howler monkey / artisan", "Eb'": "Grass / point (disputed)",
    "Ben": "Reed / maize sprout", "Ix": "Jaguar", "Men": "Eagle / (moon, aged one)",
    "Kib'": "Wax / offering (contested)", "Kaban": "Earth / earthquake",
    "Etz'nab'": "Flint / obsidian blade", "Kawak": "Storm / rain", "Ajaw": "Lord / ruler"
  };

  var HAAB_MONTH_MEANING = {
    "Pop": "Mat — symbol of authority; New Year's month",
    "Wo'": "Black conjunction (etymology debated)",
    "Sip": "Red conjunction; associated with a hunting deity",
    "Sotz'": "Bat", "Sek": "Meaning uncertain",
    "Xul": "End / dog (readings vary)", "Yaxk'in": "New/green sun — dry-season heat",
    "Mol": "Gathering / water (readings vary)", "Ch'en": "Cave / well — black months begin",
    "Yax": "Green / first", "Sak'": "White", "Keh": "Red / deer",
    "Mak": "Enclosing / lid", "K'ank'in": "Yellow sun (readings vary)",
    "Muwan": "Screech-owl / overcast sky", "Pax": "Drum / spreading",
    "K'ayab": "Turtle (readings vary)", "Kumk'u": "Granary / ripeness",
    "Wayeb'": "The 5 nameless days — a dangerous, liminal period"
  };

  /* ---------- expose ---------- */
  global.MC = {
    CORRELATION: CORRELATION,
    DAY_SIGNS: DAY_SIGNS, HAAB_MONTHS: HAAB_MONTHS, LORDS: LORDS,
    LONG_COUNT_UNITS: LONG_COUNT_UNITS,
    DAY_SIGN_MEANING: DAY_SIGN_MEANING, HAAB_MONTH_MEANING: HAAB_MONTH_MEANING,
    YEAR_BEARERS: YEAR_BEARERS, E819_DIRS: E819_DIRS,
    DS_SEALS: DS_SEALS, DS_SEAL_MAYA: DS_SEAL_MAYA, DS_TONES: DS_TONES,
    DS_TONE_ACTION: DS_TONE_ACTION, DS_COLORS: DS_COLORS, DS_ANCHOR: DS_ANCHOR,

    gregorianToJDN: gregorianToJDN, jdnToGregorian: jdnToGregorian, mod: mod,
    longCountFromTotal: longCountFromTotal, totalFromLongCount: totalFromLongCount, formatLC: formatLC,
    tzolkinFromTotal: tzolkinFromTotal, trecenaOf: trecenaOf,
    haabFromTotal: haabFromTotal, haabLabel: haabLabel,
    lordFromTotal: lordFromTotal,
    calendarRoundPosition: calendarRoundPosition, calendarRoundLabel: calendarRoundLabel,
    nextCalendarRoundRecurrence: nextCalendarRoundRecurrence,
    count819: count819, lunar: lunar, yearBearer: yearBearer, nextPeriodEndings: nextPeriodEndings,
    readingFromTotal: readingFromTotal, readingFromGregorian: readingFromGregorian,
    readingFromLongCount: readingFromLongCount,
    todayInZone: todayInZone, formatGregorian: formatGregorian, MONTHS_G: MONTHS_G,

    dreamspell: dreamspell, kinDetail: kinDetail, dreamspellVsTraditional: dreamspellVsTraditional,
    countFeb29Between: countFeb29Between,

    parseQuery: parseQuery
  };

})(window);
