// leaderBoard.js (updated)
// Changes:
//  - Uses a one-time fetch (.get()) instead of realtime listener (.onSnapshot()) to reduce reads
//  - Adds .limit(TOP_N) so you never read the whole collection
//  - Formats Firestore Timestamp nicely for display
//  - Escapes Username to avoid HTML injection in your table
// leaderBoardScript.js (safe + low-read)

// Wrap in an IIFE so we don't leak variables globally
(() =>
{
    const firebaseConfigLB =
    {
        apiKey: "AIzaSyDIkbRWGDcqaF0UA5KM0P1LFjZsnR5mX_c",
        authDomain: "guessthatgame-9454c.firebaseapp.com",
        databaseURL: "https://guessthatgame-9454c.firebaseio.com",
        projectId: "guessthatgame-9454c",
        storageBucket: "guessthatgame-9454c.appspot.com",
        messagingSenderId: "1035180389643",
        appId: "1:1035180389643:web:21d8c95e71d410cfcc1e0e"
    };

    if (!firebase.apps.length)
    {
        firebase.initializeApp(firebaseConfigLB);
    }

    const dbLeaderboards = firebase.firestore();
    const TOP_N = 100;

    const tabla = document.getElementById('tabla');
    if (!tabla)
    {
        console.error("Leaderboard table body (#tabla) not found.");
        return;
    }

    function escapeHtml(value)
    {
        if (value === null || value === undefined) return '';
        return String(value).replace(/[&<>"'`=\/]/g, (s) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '`': '&#96;',
                '=': '&#61;',
                '/': '&#47;'
            })[s]
        );
    }

    function formatDateAdded(dateAdded)
    {
        if (dateAdded && typeof dateAdded.toDate === 'function')
        {
            const d = dateAdded.toDate();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        }
        return dateAdded ? String(dateAdded) : '';
    }

    async function loadLeaderboard()
    {
        try
        {
            tabla.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;

            const snapshot = await dbLeaderboards
                .collection("leaderboard")
                .orderBy("Score", "desc")
                .limit(TOP_N)
                .get();

            if (snapshot.empty)
            {
                tabla.innerHTML = `<tr><td colspan="3">No scores yet.</td></tr>`;
                return;
            }

            let rows = '';
            snapshot.forEach((doc) =>
            {
                const data = doc.data() || {};
                const username = escapeHtml(data.Username);
                const score = (data.Score !== undefined && data.Score !== null) ? data.Score : '';
                const dateAdded = escapeHtml(formatDateAdded(data.DateAdded));

                rows += `
                    <tr>
                        <td>${username}</td>
                        <td>${score}</td>
                        <td>${dateAdded}</td>
                    </tr>
                `;
            });

            tabla.innerHTML = rows;
        }
        catch (err)
        {
            console.error("Failed to load leaderboard:", err);
            tabla.innerHTML = `<tr><td colspan="3">Error loading leaderboard.</td></tr>`;
        }
    }

    loadLeaderboard();
})();
