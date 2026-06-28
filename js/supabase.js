const SUPABASE_URL = "https://ebeqpzyyjcihweyodccc.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXFwenl5amNpaHdleW9kY2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzAwNDMsImV4cCI6MjA5ODIwNjA0M30.umsP_C5y7DvML8UvSMmXVZSLDor8BgLURtLGeCARnIg";

async function supabaseSelect(table) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  return await response.json();
}

async function supabaseInsert(table, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(data)
  });

  return await response.json();
}