"use client";

import axios from "axios";

export async function getScheduleTable() {
  try {
    // Construct the absolute URL for the API endpoint
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const response = await axios.get(`${baseUrl}/api/course-schedule`);
    
    // Get the HTML data
    const htmlData = response.data.data;
    
    // Early return if no data
    if (!htmlData) {
      console.error("No HTML data received");
      return null;
    }
    
    // Process the HTML as a string with regex to preserve the exact structure
    if (typeof window !== "undefined") {
      const baseURL = "https://www.coloradocollege.edu/academics/curriculum/catalog/";
      
      // First, modify hrefs to use absolute URLs
      const modifiedHtml: string = htmlData.replace(
        /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
        ((match: string, beforeHref: string, hrefValue: string, afterHref: string): string => {
            // Only modify relative URLs
            if (hrefValue && !hrefValue.startsWith('http') && !hrefValue.startsWith('//')) {
                // Clean the href value to avoid double slashes
                const cleanHref: string = hrefValue.startsWith('/') ? hrefValue.substring(1) : hrefValue;
                // Return the anchor tag with the modified href
                return `<a ${beforeHref}href="${baseURL}${cleanHref}"${afterHref}>`;
            }
            // Return unchanged if it's already an absolute URL
            return match;
        })
      );
      
      // Log for debugging
      console.log("Modified anchor elements to be clickable links");
      
      return modifiedHtml;
    }
    
    return htmlData;
  } catch (error) {
    console.error("Error fetching or processing course data:", error);
    return null;
  }
}


