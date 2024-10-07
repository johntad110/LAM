import { NextResponse } from "next/server";

// Helper function to call Landsat acquisition tool API
async function getLandsatData(lat: number, lng: number) {
  const url = `https://landsat.usgs.gov/landsat_acq?lat=${lat}&lon=${lng}`;
  
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error('Failed to fetch Landsat acquisition data.');
  }
  
  return res.json();
}

// Helper function to retrieve additional data from shapefiles/KML files
async function getLandsatShapeData() {
  const url = `https://www.usgs.gov/landsat-missions/landsat-shapefiles-and-kml-files`;
  
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error('Failed to fetch Landsat shapefiles.');
  }
  
  return res.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { latitude, longitude, notifyTime } = body;

    if (!latitude || !longitude || !notifyTime) {
      return NextResponse.json(
        { message: "Missing required fields: latitude, longitude, notifyTime" },
        { status: 400 }
      );
    }

    // Fetch Landsat data for the provided coordinates
    const landsatData = await getLandsatData(latitude, longitude);

    // Fetch additional Landsat shapefile/KML data if needed
    const landsatShapeData = await getLandsatShapeData();

    // TO-DO: Process notification logic (save to DB AND THEN set up notification timing)
    
    // Respond with satellite pass data and any processed information
    return NextResponse.json({
      message: "Successfully fetched Landsat data",
      notifyTime,
      landsatData,
      landsatShapeData,
    });

  } catch (error) {
    console.error("Error in notify_me API:", error);
    return NextResponse.json(
      { message: "Failed to fetch satellite data" },
      { status: 500 }
    );
  }
}
