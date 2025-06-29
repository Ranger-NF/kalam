import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const RANGE = "Outreach!A1:Z";

interface ChecklistItem {
  group: string;
  done: boolean;
  col: number;
}

interface Activity {
  name: string;
  items: ChecklistItem[];
  row: number;
  editable: boolean;
  collapsed: boolean;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.google && window.gapi) {
        clearInterval(checkReady);
        initializeGapiClient();
      }
    }, 100);
  }, []);

  const initializeGapiClient = () => {
    window.gapi.load("client", async () => {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
      });

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        callback: (resp: any) => {
          if (resp.access_token) {
            localStorage.setItem("gapi_token", resp.access_token);
            setToken(resp.access_token);
            fetchActivities();
          } else {
            alert("Token error");
          }
        },
      });

      const token = localStorage.getItem("gapi_token");

      if (token) {
        setToken(token);
        fetchActivities();

        // This ensures we refresh silently in the background
        tokenClient.requestAccessToken({ prompt: "" });
      } else {
        // Prompt login only if no saved token
        tokenClient.requestAccessToken();
      }
    });
  };

  const fetchActivities = async () => {
    setLoading(true);
    const res = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows: string[][] = res.result.values;
    if (!rows || rows.length < 2) return;

    const headers = rows[0].slice(1); // B1:Z1
    const dataRows = rows.slice(1); // from row 2 onwards

    const parsed: Activity[] = dataRows.map((row, rIdx) => {
      const name = row[0]; // A2, A3...
      const items: ChecklistItem[] = headers.map((group, i) => ({
        group,
        done: row[i + 1] === "TRUE",
        col: i,
      }));
      const editable = !row[0].toLowerCase().includes("[!]"); // example rule
      return { name, items, row: rIdx + 2, editable, collapsed: true };
    });

    // parsed[0].collapsed = false;

    setActivities(parsed);
    setLoading(false);
  };

  const toggleCheckbox = async (activityIndex: number, itemIndex: number) => {
    const updated = [...activities];
    const activity = updated[activityIndex];
    const item = activity.items[itemIndex];

    if (!activity.editable) return;

    item.done = !item.done;

    setActivities(updated);

    const colLetter = String.fromCharCode(66 + item.col); // B = 66
    const cell = `Outreach!${colLetter}${activity.row}`;
    const value = item.done;

    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: cell,
      valueInputOption: "RAW",
      resource: {
        values: [[value]],
      },
    });
  };

  const toggleCollapse = (i: number) => {
    const updated = [...activities];
    updated[i].collapsed = !updated[i].collapsed;
    setActivities(updated);
  };

  return (
    <div className="p-4 pt-[100px] pb-[80px] max-w-md mx-auto text-[var(--text)]">
      <h2 className="fixed top-0 w-full bg-white text-2xl font-bold p-4 z-10 border-b border-gray-300">
        കളം | 📋 GSheet Checklist
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="border-zinc-800 rounded-xl shadow-md">
              <button
                onClick={() => toggleCollapse(i)}
                className="w-full flex items-center justify-between px-4 text-left hover:bg-gray-200 rounded-t-xl py-3"
              >
                <span className="font-semibold text-lg">{activity.name}</span>
                {activity.collapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {!activity.collapsed && (
                <div className="px-4 pb-4 space-y-2">
                  {activity.items.map((item, j) => (
                    <label
                      key={j}
                      className={`flex items-center justify-between border-zinc-900 px-4 py-2 rounded-lg ${
                        activity.editable
                          ? "cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <span>{item.group}</span>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleCheckbox(i, j)}
                        disabled={!activity.editable}
                        className="w-5 h-5 accent-green-500"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("gapi_token");
          location.reload();
        }}
        className="fixed bottom-4 right-4 px-4 py-2 rounded-md text-sm bg-red-500 text-white shadow-md"
      >
        Reset Login
      </button>
    </div>
  );
};

export default App;
