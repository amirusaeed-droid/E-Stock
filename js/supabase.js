const SUPABASE_URL = "https://ebeqpzyyjcihweyodccc.supabase.co";

const SUPABASE_KEY = "sb_publishable_HDwkdB4mfPXOIxi9-7ZczQ_q3P9MaO6";

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