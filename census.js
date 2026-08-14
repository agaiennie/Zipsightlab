/* Zipsight Lab — Census proxy (Netlify serverless function).
   Runs on the SERVER, so it can call the US Census API (no browser CORS limit).
   The site calls /.netlify/functions/census?zip=XXXXX and gets clean JSON back.
   Zero dependencies (uses global fetch on Netlify's Node 18+ runtime).
   Optional: set a free CENSUS_API_KEY env var in Netlify for higher volume. */
exports.handler = async function (event) {
  var cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400' // Census ACS updates yearly — cache a day
  };
  var zip = (((event.queryStringParameters || {}).zip) || '').replace(/[^0-9]/g, '').slice(0, 5);
  if (zip.length !== 5) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Enter a 5-digit ZIP.' }) };

  var key = process.env.CENSUS_API_KEY ? '&key=' + process.env.CENSUS_API_KEY : '';
  var vars = 'NAME,B01003_001E,B11001_001E,B19013_001E,B01002_001E,B25077_001E,B15003_001E,B15003_022E,B15003_023E,B15003_024E,B15003_025E';
  var url = 'https://api.census.gov/data/2022/acs/acs5?get=' + vars + '&for=zip%20code%20tabulation%20area:' + zip + key;

  try {
    var r = await fetch(url);
    if (!r.ok) return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'Census API returned ' + r.status }) };
    var rows = await r.json();
    var d = rows && rows[1];
    if (!d) return { statusCode: 404, headers: cors, body: JSON.stringify({ error: 'No Census data for ZIP ' + zip + ' (not every ZIP is a Census area).' }) };
    var num = function (x) { var v = parseFloat(x); return isFinite(v) && v > -666666 ? v : null; };
    var eduTot = num(d[6]);
    var bach = (num(d[7]) || 0) + (num(d[8]) || 0) + (num(d[9]) || 0) + (num(d[10]) || 0);
    var out = {
      zip: zip, place: d[0] || ('ZIP ' + zip),
      population: num(d[1]), households: num(d[2]), income: num(d[3]),
      medianAge: num(d[4]), medianHome: num(d[5]),
      bachPct: eduTot ? +(100 * bach / eduTot).toFixed(1) : null
    };
    return { statusCode: 200, headers: cors, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Proxy error: ' + String(e && e.message || e) }) };
  }
};
