export async function getGlideData() {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwPaDRoieGEY-6WOrVzUX1JsQlHqIIV2SExc4binnXaqtdvzd4sv5XSw4KIOLkLIkcH/exec
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching Google Sheet data:", err);
    return [];
  }
}