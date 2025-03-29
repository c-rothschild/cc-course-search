import { NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';

// Helper function to handle CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:3000', // Replace with your frontend's origin
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

console.log(corsHeaders());

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    // Make the request server-side
    const response = await axios.get("https://www.coloradocollege.edu/academics/curriculum/catalog/schedule.html");
    const html = response.data;

    // Load HTML into cheerio
    const $ = load(html);

    // Select the table with data-jplist-group="courses" attribute
    const coursesTable = $('table[data-jplist-group="courses"]');

    // Check if the table was found
    if (coursesTable.length) {
      console.log("Found the courses table!");
      console.log(`Table has ${coursesTable.find('tr').length} rows`);

      // Return the HTML of the table with CORS headers
      return NextResponse.json(
        {
          success: true,
          data: coursesTable.html(),
        },
        {
          headers: corsHeaders(),
        }
      );
    } else {
      console.log("Courses table not found.");
      return NextResponse.json(
        {
          success: false,
          error: "Courses table not found",
        },
        {
          status: 404,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Error scraping site:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course data",
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}