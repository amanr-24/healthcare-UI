export async function apiGet(url) {
  const res = await fetch(`https://healthcare-backend-szmd.onrender.com/api${url}`);
  return res.json();
}
  