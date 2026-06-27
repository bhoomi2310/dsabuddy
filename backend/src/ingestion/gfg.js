import { fetchJson } from "./http.js";

export async function fetchGfgUserStats({ username }) {
  if (!username) throw new Error("GFG username is required");
  const cleanUsername = String(username).trim();

  try {
    // Fetch profile info from authapi
    const profileUrl = `https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle=${cleanUsername}&article_count=false&redirect=true`;
    
    // We can also fetch submissions count as a fallback/validation
    const submissionsUrl = "https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/";

    let profileData = null;
    let submissionsCount = null;

    try {
      const res = await fetchJson(profileUrl, { timeoutMs: 5000 });
      if (res && res.data) {
        profileData = res.data;
      }
    } catch (err) {
      console.warn(`GFG profile API failed for user ${cleanUsername}:`, err.message);
    }

    try {
      const res = await fetch(submissionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify({ handle: cleanUsername, requestType: "", year: "", month: "" }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const subData = await res.json();
        if (subData && typeof subData.count === "number") {
          submissionsCount = subData.count;
        }
      }
    } catch (err) {
      console.warn(`GFG submissions API failed for user ${cleanUsername}:`, err.message);
    }

    if (!profileData && submissionsCount === null) {
      throw new Error(`Could not retrieve data from GFG APIs for user '${cleanUsername}'`);
    }

    const name = profileData?.name || cleanUsername;
    const score = profileData?.score || 0;
    const solvedFromProfile = profileData?.total_problems_solved || 0;

    return {
      username: cleanUsername,
      problemsSolved: solvedFromProfile || submissionsCount || 0,
      rating: null,
      stars: null,
      rankLabel: "Geek",
    };
  } catch (error) {
    console.error("Error fetching GFG stats:", error);
    throw error;
  }
}

export async function fetchGfgCalendar({ username }) {
  if (!username) throw new Error("GFG username is required");
  const cleanUsername = String(username).trim();

  try {
    const submissionsUrl = "https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/";
    const res = await fetch(submissionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({ handle: cleanUsername, requestType: "", year: "", month: "" }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      throw new Error(`GFG submissions API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const submissionCalendar = {};

    if (data && data.result) {
      for (const category of Object.values(data.result)) {
        if (!category || typeof category !== "object") continue;
        for (const prob of Object.values(category)) {
          if (prob && prob.user_subtime) {
            const user_subtime = String(prob.user_subtime).trim();
            const dateStr = user_subtime.split(" ")[0]; // "YYYY-MM-DD"
            if (dateStr && dateStr.length === 10) {
              const dateObj = new Date(Date.UTC(
                Number(dateStr.slice(0, 4)),
                Number(dateStr.slice(5, 7)) - 1,
                Number(dateStr.slice(8, 10))
              ));
              const startOfDaySeconds = Math.floor(dateObj.getTime() / 1000);
              if (Number.isFinite(startOfDaySeconds)) {
                submissionCalendar[startOfDaySeconds] = (submissionCalendar[startOfDaySeconds] || 0) + 1;
              }
            }
          }
        }
      }
    }

    return {
      submissionCalendar,
      totalActiveDays: Object.keys(submissionCalendar).length,
    };
  } catch (error) {
    console.error(`Error fetching GFG calendar for ${username}:`, error);
    throw new Error(`GFG calendar fetch failed: ${error.message}`);
  }
}