// Vercel Serverless Function: exposes ONLY public config to the browser.
// Set these in Vercel → Project → Settings → Environment Variables:
//   SUPABASE_URL       = https://xxxx.supabase.co
//   SUPABASE_ANON_KEY  = eyJ... (anon public key)
// Never put the service_role key here.
module.exports = (req, res) => {
  const body = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};
