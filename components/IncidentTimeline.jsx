import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import _ from "lodash";

const IncidentTimeline = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  // Add tracking for date range
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Track if the filters panel is expanded
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Track the currently active resident filter
  const [residentFilter, setResidentFilter] = useState("all");
  
  // Track the currently active location filter
  const [locationFilter, setLocationFilter] = useState("all");

  // Get type tag style
  const getTypeTagStyle = (type) => {
    switch (type) {
      case "Theft":
        return "bg-red-700 text-white";
      case "Vandalism":
        return "bg-orange-700 text-white";
      case "Disturbance":
        return "bg-yellow-700 text-white";
      case "Trespass":
        return "bg-purple-700 text-white";
      default:
        return "bg-gray-700 text-white";
    }
  };

  // Get card background color based on incident type
  const getCardBackgroundColor = (type) => {
    switch (type) {
      case "Theft":
        return "bg-gradient-to-br from-red-100 to-red-50 border-red-400";
      case "Vandalism":
        return "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-400";
      case "Disturbance":
        return "bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-400";
      case "Trespass":
        return "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-400";
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-50 border-gray-400";
    }
  };

  // Get emoji for incident type
  const getTypeEmoji = (type) => {
    switch (type) {
      case "Theft":
        return "🚨";
      case "Vandalism":
        return "🔨";
      case "Disturbance":
        return "🔊";
      case "Trespass":
        return "🚷";
      default:
        return "❓";
    }
  };

  // Get incident-specific emoji
  const getIncidentEmoji = (incident) => {
    const incidentText = incident.Incident?.toLowerCase() || "";

    if (incidentText.includes("bike")) return "🚲";
    if (incidentText.includes("package") || incidentText.includes("amazon"))
      return "📦";
    if (incidentText.includes("car") || incidentText.includes("vehicle"))
      return "🚗";
    if (incidentText.includes("window") || incidentText.includes("glass"))
      return "🪟";
    if (incidentText.includes("door")) return "🚪";
    if (incidentText.includes("mail")) return "📮";
    if (incidentText.includes("elevator")) return "🛗";
    if (incidentText.includes("garage")) return "🅿️";
    if (incidentText.includes("noise")) return "📢";
    if (incidentText.includes("urine")) return "💦";
    if (incidentText.includes("storage")) return "🗄️";
    if (incidentText.includes("fire")) return "🔥";
    if (incidentText.includes("alarm")) return "🚨";

    // Default to the type emoji if no specific match
    return getTypeEmoji(incident.Type);
  };

  // Get location tag style
  const getLocationTagStyle = (location) => {
    if (!location) return "bg-gray-700 text-white";

    const locationLower = location.toLowerCase();
    if (locationLower.includes("garage")) return "bg-blue-600 text-white";
    if (locationLower.includes("front entrance"))
      return "bg-purple-600 text-white";
    if (locationLower.includes("elevator")) return "bg-amber-700 text-white";
    if (locationLower.includes("west side")) return "bg-pink-600 text-white";
    if (locationLower.includes("east side")) return "bg-pink-600 text-white";
    if (locationLower.includes("alley")) return "bg-green-700 text-white";
    if (locationLower.includes("stairwell")) return "bg-yellow-700 text-white";
    if (locationLower.includes("courtyard")) return "bg-gray-600 text-white";
    if (locationLower.includes("mail")) return "bg-indigo-600 text-white";
    if (locationLower.includes("sidewalk")) return "bg-teal-700 text-white";
    if (locationLower.includes("hall")) return "bg-cyan-700 text-white";
    if (locationLower.includes("lobby")) return "bg-fuchsia-700 text-white";

    return "bg-gray-600 text-white";
  };

  const processIncidents = (data) => {
    // Process dates and sort chronologically
    const processedData = data.map((incident) => {
      // Parse the date
      const dateParts = incident.Date ? incident.Date.split(",") : [""];
      let dateObj = new Date(incident.Date);

      return {
        ...incident,
        dateObj: dateObj,
      };
    });

    // Sort by date (newest first)
    return _.sortBy(processedData, (item) => item.dateObj).reverse();
  };

  useEffect(() => {
    // Fallback function to load sample data when the file can't be accessed
    const loadSampleData = () => {
      console.log("Loading sample data...");
      const sampleData = [
        {
          Incident: "Patio Storage breakin attempted",
          Date: "February 14, 2025",
          Type: "Disturbance",
          Location: "West Side Entrance",
          Unit: 107,
          "Resident Name": "Amna Akbar",
          Notes: null,
        },
        {
          Incident: "Garage Storage Tarp ripped",
          Date: "February 14, 2025",
          Type: "Vandalism",
          Location: "Garage",
          Unit: 107,
          "Resident Name": "Amna Akbar",
          Notes: null,
        },
        {
          Incident: "Urine in elevator",
          Date: "February 14, 2025",
          Type: "Vandalism",
          Location: "Elevator",
          Unit: "Unknown",
          "Resident Name": "Unknown",
          Notes: "Repeat Offender",
        },
        {
          Incident: "Package theft",
          Date: "January 15, 2025",
          Type: "Theft",
          Location: "Mail Room",
          Unit: 205,
          "Resident Name": "John Smith",
          Notes: "Amazon package",
          "Estimated Value": 49.99,
        },
      ];

      setIncidents(processIncidents(sampleData));
      setLoading(false);
    };

    const loadData = async () => {
      try {
        // Fetch data from our API endpoint instead of directly from CSV
        const response = await fetch("/api/incidents");
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.message || "Failed to fetch incidents");

        setIncidents(processIncidents(data));
        setLoading(false);
      } catch (err) {
        console.error("Error loading incidents:", err);
        setError("Error loading incidents: " + err.message);
        loadSampleData(); // Fall back to sample data
      }
    };

    loadData();
  }, []);

  // Get unique incident types for filtering
  const incidentTypes = React.useMemo(() => {
    // Get unique types
    const types = [
      ...new Set(incidents.map((incident) => incident.Type).filter(Boolean)),
    ];

    // Sort types in custom order: Theft, Disturbance, Vandalism, Trespass, and others alphabetically
    const typeOrder = {
      Theft: 1,
      Disturbance: 2,
      Vandalism: 3,
      Trespass: 4,
    };

    types.sort((a, b) => {
      const orderA = typeOrder[a] || 99;
      const orderB = typeOrder[b] || 99;
      return orderA - orderB;
    });

    // Add 'all' at the beginning
    return ["all", ...types];
  }, [incidents]);

  // Get unique residents for filtering
  const residents = React.useMemo(() => {
    const uniqueResidents = [
      ...new Set(
        incidents.map((incident) => incident["Resident Name"]).filter(Boolean)
      ),
    ].sort();

    return ["all", ...uniqueResidents];
  }, [incidents]);

  // Get unique locations for filtering
  const locations = React.useMemo(() => {
    const uniqueLocations = [
      ...new Set(
        incidents.map((incident) => incident.Location).filter(Boolean)
      ),
    ].sort();

    return ["all", ...uniqueLocations];
  }, [incidents]);

  // Calculate filtered incidents based on all active filters
  const filteredIncidents = React.useMemo(() => {
    return incidents.filter((incident) => {
      // Type filter
      if (filter !== "all" && incident.Type !== filter) {
        return false;
      }

      // Resident filter
      if (
        residentFilter !== "all" &&
        incident["Resident Name"] !== residentFilter
      ) {
        return false;
      }

      // Location filter
      if (locationFilter !== "all" && incident.Location !== locationFilter) {
        return false;
      }

      // Date range filter
      if (dateRange.startDate && dateRange.endDate) {
        const incidentDate = incident.dateObj;
        if (
          incidentDate < dateRange.startDate ||
          incidentDate > dateRange.endDate
        ) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, filter, residentFilter, locationFilter, dateRange]);

  // Group filtered incidents by month and year
  const groupedIncidents = _.groupBy(filteredIncidents, (incident) => {
    const date = incident.dateObj;
    return date ? `${date.getFullYear()}-${date.getMonth() + 1}` : "Unknown";
  });

  if (loading)
    return (
      <div className="flex justify-center p-8">Loading incident data...</div>
    );
  if (error)
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        {error}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Incident Report Timeline
        </h1>

        {/* Summary Badge */}
        <div className="bg-white px-3 py-1 rounded-full shadow border border-gray-200 text-sm">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </div>
      </div>

      {/* Filter controls */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Filter by incident type:</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {incidentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm transition-all shadow ${
                filter === type
                  ? type === "Theft"
                    ? "bg-red-600 text-white font-medium transform scale-105"
                    : type === "Disturbance"
                    ? "bg-yellow-600 text-white font-medium transform scale-105"
                    : type === "Vandalism"
                    ? "bg-orange-600 text-white font-medium transform scale-105"
                    : type === "Trespass"
                    ? "bg-purple-600 text-white font-medium transform scale-105"
                    : "bg-blue-600 text-white font-medium transform scale-105"
                  : "bg-white hover:bg-gray-100 text-gray-700"
              }`}
            >
              {type === "all"
                ? "🔍 All Types"
                : `${getTypeEmoji(type)} ${type}`}
              {type !== "all" &&
                ` (${incidents.filter((i) => i.Type === type).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className="transition-transform hover:scale-105 focus:outline-none"
        >
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer h-full">
            <div className="text-sm text-gray-600 font-medium">
              Total Incidents
            </div>
            <div className="text-2xl font-bold flex items-center text-blue-700">
              <span className="text-3xl mr-2">📊</span>
              {incidents.length}
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter("Theft")}
          className="transition-transform hover:scale-105 focus:outline-none"
        >
          <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-lg shadow-md border-l-4 border-red-700 cursor-pointer h-full">
            <div className="text-sm text-gray-600 font-medium">Theft</div>
            <div className="text-2xl font-bold flex items-center text-red-700">
              <span className="text-3xl mr-2">🚨</span>
              {incidents.filter((i) => i.Type === "Theft").length}
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter("Disturbance")}
          className="transition-transform hover:scale-105 focus:outline-none"
        >
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-4 rounded-lg shadow-md border-l-4 border-yellow-700 cursor-pointer h-full">
            <div className="text-sm text-gray-600 font-medium">Disturbance</div>
            <div className="text-2xl font-bold flex items-center text-yellow-700">
              <span className="text-3xl mr-2">🔊</span>
              {incidents.filter((i) => i.Type === "Disturbance").length}
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter("Vandalism")}
          className="transition-transform hover:scale-105 focus:outline-none"
        >
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-4 rounded-lg shadow-md border-l-4 border-orange-700 cursor-pointer h-full">
            <div className="text-sm text-gray-600 font-medium">Vandalism</div>
            <div className="text-2xl font-bold flex items-center text-orange-700">
              <span className="text-3xl mr-2">🔨</span>
              {incidents.filter((i) => i.Type === "Vandalism").length}
            </div>
          </div>
        </button>
      </div>

      {/* Advanced filter toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAdvancedFilters ? (
            <>
              <span>Hide Advanced Filters</span>
              <span className="text-lg">▲</span>
            </>
          ) : (
            <>
              <span>Show Advanced Filters</span>
              <span className="text-lg">▼</span>
            </>
          )}
        </button>

        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block mb-2 font-medium">
                  Filter by Date Range
                </label>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-sm text-gray-600 mr-2">Start:</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded p-1"
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        setDateRange((prev) => ({ ...prev, startDate: date }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mr-2">End:</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded p-1"
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        setDateRange((prev) => ({ ...prev, endDate: date }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Resident Filter */}
              <div>
                <label className="block mb-2 font-medium">
                  Filter by Resident
                </label>
                <select
                  className="w-full border border-gray-300 rounded p-2"
                  value={residentFilter}
                  onChange={(e) => setResidentFilter(e.target.value)}
                >
                  <option value="all">All Residents</option>
                  {residents
                    .filter((r) => r !== "all")
                    .map((resident) => (
                      <option key={resident} value={resident}>
                        {resident} (
                        {
                          incidents.filter(
                            (i) => i["Resident Name"] === resident
                          ).length
                        }
                        )
                      </option>
                    ))}
                </select>
              </div>
              
              {/* Location Filter */}
              <div>
                <label className="block mb-2 font-medium">
                  Filter by Location
                </label>
                <select
                  className="w-full border border-gray-300 rounded p-2"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locations
                    .filter((loc) => loc !== "all")
                    .map((location) => (
                      <option key={location} value={location}>
                        {location} ({incidents.filter((i) => i.Location === location).length})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Filter reset button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilter("all");
                  setResidentFilter("all");
                  setLocationFilter("all");
                  setDateRange({ startDate: null, endDate: null });
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline vertical line - setting width to 0 to hide it */}
        <div className="absolute left-8 top-0 bottom-0 w-0 bg-gray-200 ml-3"></div>

        {Object.entries(groupedIncidents).map(
          ([yearMonth, monthIncidents], groupIndex) => {
            // Create date label from yearMonth (format: YYYY-MM)
            const [year, month] = yearMonth.split("-").map(Number);
            const monthName = new Date(year, month - 1).toLocaleString(
              "default",
              { month: "long" }
            );

            return (
              <div key={yearMonth} className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-auto min-w-32 px-4 h-8 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full z-10 font-bold shadow-md">
                    {isNaN(month) ? "Unknown" : `${monthName} ${year}`}
                  </div>
                  <div className="h-px flex-grow bg-gray-300 ml-4"></div>
                </div>

                {monthIncidents.map((incident, i) => (
                  <div key={i} className="ml-4 relative mb-6">
                    <div
                      className={`p-4 border rounded-lg shadow-md ${getCardBackgroundColor(
                        incident.Type
                      )}`}
                    >
                      <div className="flex justify-between">
                        <span className="font-bold">{incident.Date}</span>
                        {incident["Approximate Time"] && (
                          <span className="text-gray-600">
                            {incident["Approximate Time"]}:00
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium mt-1 flex items-center">
                        <span className="text-2xl mr-2">
                          {getIncidentEmoji(incident)}
                        </span>
                        {incident.Incident}
                      </h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm text-gray-500">Type:</span>{" "}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeTagStyle(
                              incident.Type
                            )}`}
                          >
                            {incident.Type || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Location:
                          </span>{" "}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getLocationTagStyle(
                              incident.Location
                            )}`}
                          >
                            {incident.Location || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Unit:</span>{" "}
                          {incident.Unit || "N/A"}
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Resident:
                          </span>{" "}
                          {incident["Resident Name"] || "N/A"}
                        </div>
                        {incident["Estimated Value"] && (
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">
                              Estimated Value:
                            </span>{" "}
                            ${incident["Estimated Value"]}
                          </div>
                        )}
                      </div>
                      {incident.Notes && (
                        <div className="mt-2 text-gray-700 bg-white bg-opacity-70 p-2 rounded border border-gray-200">
                          <span className="text-sm text-gray-500">Notes:</span>{" "}
                          {incident.Notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
        )}

        {Object.keys(groupedIncidents).length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500 mb-4">
              No incidents match the selected filters.
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setResidentFilter("all");
                setDateRange({ startDate: null, endDate: null });
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentTimeline;
