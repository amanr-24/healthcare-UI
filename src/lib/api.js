export async function apiGet(url) {
  const res = await fetch(`https://healthcare-dashboard-n8rs.onrender.com/api${url}`);
  return res.json();
}
  